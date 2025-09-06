import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'acorn';
import { simple } from 'acorn-walk';
// @ts-ignore
import webFeatures from 'web-features';

export interface ScanIssue {
  file: string;
  line: number;
  column: number;
  api: string;
  type: 'deprecated' | 'non-baseline' | 'unsafe';
  description: string;
  suggestion: string;
  browserSupport: string;
  context: string;
  aiSuggestion?: {
    alternative: string;
    explanation: string;
    codeExample: string;
    browserSupport: string;
  };
}

export interface ScanResults {
  filesScanned: number;
  filesWithIssues: number;
  issues: ScanIssue[];
  timestamp: string;
}

export class BaselineScanner {
  private nonBaselineAPIs: Map<string, any>;
  
  constructor() {
    this.nonBaselineAPIs = new Map();
    this.loadWebFeatures();
  }
  
  private loadWebFeatures() {
    // Load web-features data
    for (const [featureId, feature] of Object.entries(webFeatures as any)) {
      if (feature.status?.baseline === false || feature.status?.baseline_low_date === undefined) {
        if (feature.compat_features) {
          feature.compat_features.forEach((apiName: string) => {
            this.nonBaselineAPIs.set(apiName, {
              featureId,
              ...feature,
              apiName
            });
          });
        }
      }
    }
    
    // Add manually tracked problematic APIs
    const manualAPIs = {
      'document.execCommand': {
        suggestion: 'Use the Clipboard API (navigator.clipboard)',
        status: 'deprecated',
        browserSupport: 'Use navigator.clipboard instead',
        description: 'Deprecated and unreliable API'
      },
      'webkitRequestAnimationFrame': {
        suggestion: 'Use requestAnimationFrame',
        status: 'deprecated',
        browserSupport: 'Use standard requestAnimationFrame',
        description: 'Vendor-prefixed API no longer needed'
      },
      'mozRequestAnimationFrame': {
        suggestion: 'Use requestAnimationFrame',
        status: 'deprecated',
        browserSupport: 'Use standard requestAnimationFrame',
        description: 'Vendor-prefixed API no longer needed'
      },
      'webkitGetUserMedia': {
        suggestion: 'Use navigator.mediaDevices.getUserMedia',
        status: 'deprecated',
        browserSupport: 'Use modern promise-based getUserMedia',
        description: 'Legacy getUserMedia API'
      },
      'webkitURL': {
        suggestion: 'Use URL',
        status: 'deprecated',
        browserSupport: 'Use standard URL constructor',
        description: 'Vendor-prefixed URL constructor'
      },
      'webkitAudioContext': {
        suggestion: 'Use AudioContext',
        status: 'deprecated',
        browserSupport: 'Use standard AudioContext',
        description: 'Vendor-prefixed AudioContext'
      }
    };
    
    for (const [api, info] of Object.entries(manualAPIs)) {
      this.nonBaselineAPIs.set(api, info);
    }
  }
  
  async scanDirectory(dirPath: string): Promise<ScanResults> {
    const results: ScanResults = {
      filesScanned: 0,
      filesWithIssues: 0,
      issues: [],
      timestamp: new Date().toISOString()
    };
    
    const files = this.getJavaScriptFiles(dirPath);
    
    for (const file of files) {
      try {
        const issues = await this.scanFile(file);
        results.filesScanned++;
        
        if (issues.length > 0) {
          results.filesWithIssues++;
          results.issues.push(...issues);
        }
      } catch (error) {
        console.error(`Error scanning ${file}:`, error);
      }
    }
    
    return results;
  }
  
  private getJavaScriptFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and other common build directories
          if (!['node_modules', 'dist', 'build', '.git'].includes(entry)) {
            scanDir(fullPath);
          }
        } else if (stat.isFile()) {
          // Include JavaScript and TypeScript files
          if (/\.(js|jsx|ts|tsx|html)$/i.test(entry)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    if (fs.existsSync(dirPath)) {
      scanDir(dirPath);
    }
    
    return files;
  }
  
  async scanFile(filePath: string): Promise<ScanIssue[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const issues: ScanIssue[] = [];
    
    try {
      if (filePath.endsWith('.html')) {
        issues.push(...this.scanHTML(filePath, content));
      } else {
        issues.push(...this.scanJavaScript(filePath, content));
      }
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }
    
    return issues;
  }
  
  private scanJavaScript(filePath: string, code: string): ScanIssue[] {
    const issues: ScanIssue[] = [];
    
    try {
      const ast = parse(code, {
        ecmaVersion: 2022,
        sourceType: 'module',
        locations: true
      });
      
      simple(ast, {
        MemberExpression: (node: any) => {
          const apiCall = this.getAPICall(node);
          if (apiCall && this.nonBaselineAPIs.has(apiCall)) {
            const apiInfo = this.nonBaselineAPIs.get(apiCall);
            const context = this.getNodeContext(code, node);
            
            issues.push({
              file: filePath,
              line: node.loc.start.line,
              column: node.loc.start.column,
              api: apiCall,
              type: apiInfo.status === 'deprecated' ? 'deprecated' : 'non-baseline',
              description: apiInfo.description || `${apiCall} is not Baseline-supported`,
              suggestion: apiInfo.suggestion || 'Consider using a Baseline-supported alternative',
              browserSupport: apiInfo.browserSupport || 'Limited browser support',
              context
            });
          }
        },
        CallExpression: (node: any) => {
          const apiCall = this.getAPICall(node.callee);
          if (apiCall && this.nonBaselineAPIs.has(apiCall)) {
            const apiInfo = this.nonBaselineAPIs.get(apiCall);
            const context = this.getNodeContext(code, node);
            
            issues.push({
              file: filePath,
              line: node.loc.start.line,
              column: node.loc.start.column,
              api: apiCall,
              type: apiInfo.status === 'deprecated' ? 'deprecated' : 'non-baseline',
              description: apiInfo.description || `${apiCall} is not Baseline-supported`,
              suggestion: apiInfo.suggestion || 'Consider using a Baseline-supported alternative',
              browserSupport: apiInfo.browserSupport || 'Limited browser support',
              context
            });
          }
        }
      });
    } catch (error) {
      // If parsing fails, try simple regex scanning
      const regexIssues = this.scanWithRegex(filePath, code);
      issues.push(...regexIssues);
    }
    
    return issues;
  }
  
  private scanHTML(filePath: string, html: string): ScanIssue[] {
    const issues: ScanIssue[] = [];
    
    // Extract JavaScript from script tags
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    
    while ((match = scriptRegex.exec(html)) !== null) {
      const scriptContent = match[1];
      const scriptIssues = this.scanJavaScript(filePath, scriptContent);
      
      // Adjust line numbers
      const beforeScript = html.substring(0, match.index);
      const lineOffset = (beforeScript.match(/\n/g) || []).length;
      
      scriptIssues.forEach(issue => {
        issue.line += lineOffset;
        issues.push(issue);
      });
    }
    
    return issues;
  }
  
  private scanWithRegex(filePath: string, code: string): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = code.split('\n');
    
    for (const [api, info] of this.nonBaselineAPIs) {
      const regex = new RegExp(`\\b${api.replace('.', '\\.')}\\b`, 'g');
      
      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = regex.exec(line)) !== null) {
          issues.push({
            file: filePath,
            line: lineIndex + 1,
            column: match.index,
            api,
            type: info.status === 'deprecated' ? 'deprecated' : 'non-baseline',
            description: info.description || `${api} is not Baseline-supported`,
            suggestion: info.suggestion || 'Consider using a Baseline-supported alternative',
            browserSupport: info.browserSupport || 'Limited browser support',
            context: line.trim()
          });
        }
      });
    }
    
    return issues;
  }
  
  private getAPICall(node: any): string | null {
    if (!node) return null;
    
    if (node.type === 'MemberExpression') {
      const object = this.getNodeName(node.object);
      const property = node.property.name || node.property.value;
      return object ? `${object}.${property}` : property;
    }
    
    if (node.type === 'Identifier') {
      return node.name;
    }
    
    return null;
  }
  
  private getNodeName(node: any): string | null {
    if (!node) return null;
    
    if (node.type === 'Identifier') {
      return node.name;
    }
    
    if (node.type === 'MemberExpression') {
      const object = this.getNodeName(node.object);
      const property = node.property.name || node.property.value;
      return object ? `${object}.${property}` : property;
    }
    
    return null;
  }
  
  private getNodeContext(code: string, node: any): string {
    const lines = code.split('\n');
    const line = lines[node.loc.start.line - 1];
    return line?.trim() || '';
  }
}