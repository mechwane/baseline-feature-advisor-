// @ts-ignore
import webFeatures from 'web-features';

interface APIIssue {
  api: string;
  line: number;
  column: number;
  type: 'deprecated' | 'non-baseline' | 'unsafe';
  description: string;
  suggestion: string;
  browserSupport: string;
}

export class BaselineScanner {
  private nonBaselineAPIs: Map<string, any>;
  
  constructor() {
    this.nonBaselineAPIs = new Map();
    this.loadWebFeatures();
  }
  
  private loadWebFeatures() {
    // Load web-features data and identify non-Baseline APIs
    try {
      for (const [featureId, feature] of Object.entries(webFeatures as any)) {
        const featureData = feature as any;
        if (featureData.status?.baseline === false || featureData.status?.baseline_low_date === undefined) {
          // Extract API names from the feature
          if (featureData.compat_features) {
            featureData.compat_features.forEach((apiName: string) => {
              this.nonBaselineAPIs.set(apiName, {
                featureId,
                status: featureData.status,
                description: featureData.description,
                apiName
              });
            });
          }
        }
      }
    } catch (error) {
      console.warn('Could not load web-features data:', error);
    }
    
    // Add commonly problematic APIs manually for better coverage
    const manualAPIs = {
      'document.execCommand': {
        suggestion: 'Use the Clipboard API instead',
        status: 'deprecated',
        browserSupport: 'Limited support, use navigator.clipboard',
        description: 'Deprecated and unreliable API for clipboard operations'
      },
      'webkitRequestAnimationFrame': {
        suggestion: 'Use requestAnimationFrame instead',
        status: 'deprecated',
        browserSupport: 'Use the standard requestAnimationFrame',
        description: 'Vendor-prefixed animation frame API'
      },
      'mozRequestAnimationFrame': {
        suggestion: 'Use requestAnimationFrame instead',
        status: 'deprecated',
        browserSupport: 'Use the standard requestAnimationFrame',
        description: 'Vendor-prefixed animation frame API'
      },
      'webkitGetUserMedia': {
        suggestion: 'Use navigator.mediaDevices.getUserMedia instead',
        status: 'deprecated',
        browserSupport: 'Use the modern promise-based getUserMedia API',
        description: 'Legacy getUserMedia API'
      },
      'webkitURL': {
        suggestion: 'Use URL constructor instead',
        status: 'deprecated',
        browserSupport: 'Use the standard URL constructor',
        description: 'Vendor-prefixed URL constructor'
      },
      'webkitAudioContext': {
        suggestion: 'Use AudioContext instead',
        status: 'deprecated',
        browserSupport: 'Use the standard AudioContext',
        description: 'Vendor-prefixed AudioContext'
      },
      'showModalDialog': {
        suggestion: 'Use modern dialog elements or modal libraries',
        status: 'deprecated',
        browserSupport: 'Removed from modern browsers',
        description: 'Legacy modal dialog API'
      },
      'createObjectURL': {
        suggestion: 'Use URL.createObjectURL instead',
        status: 'deprecated',
        browserSupport: 'Use the standard URL.createObjectURL',
        description: 'Legacy object URL creation'
      }
    };
    
    for (const [api, info] of Object.entries(manualAPIs)) {
      this.nonBaselineAPIs.set(api, info);
    }
  }
  
  async scanCode(code: string): Promise<{ 
    totalAPIs: number;
    unsafeAPIs: number;
    warnings: number;
    safeAPIs: number;
    issues: APIIssue[];
  }> {
    const issues: APIIssue[] = [];
    const lines = code.split('\n');
    const detectedAPIs = new Set<string>();
    
    // Simple regex-based scanning for demo purposes
    // In production, you'd use proper AST parsing
    for (const [api, info] of this.nonBaselineAPIs) {
      const regex = new RegExp(`\\b${api.replace('.', '\\.')}\\b`, 'g');
      
      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = regex.exec(line)) !== null) {
          detectedAPIs.add(api);
          issues.push({
            api,
            line: lineIndex + 1,
            column: match.index,
            type: info.status === 'deprecated' ? 'deprecated' : 'non-baseline',
            description: info.description || `${api} is not Baseline-supported`,
            suggestion: info.suggestion || 'Consider using a Baseline-supported alternative',
            browserSupport: info.browserSupport || 'Limited browser support'
          });
        }
      });
    }
    
    // Mock some additional metrics for the demo
    const totalAPIs = Math.max(detectedAPIs.size + Math.floor(Math.random() * 10) + 5, issues.length);
    const unsafeAPIs = issues.filter(issue => issue.type === 'deprecated' || issue.type === 'unsafe').length;
    const warnings = issues.length - unsafeAPIs;
    const safeAPIs = totalAPIs - issues.length;
    
    return {
      totalAPIs,
      unsafeAPIs,
      warnings,
      safeAPIs,
      issues
    };
  }
  
  getAPIInfo(apiName: string) {
    const info = this.nonBaselineAPIs.get(apiName);
    if (info) {
      return {
        isBaseline: false,
        browserSupport: info.browserSupport || 'Limited support',
        status: info.status || 'non-baseline',
        suggestion: info.suggestion,
        description: info.description
      };
    }
    
    return {
      isBaseline: true,
      browserSupport: 'Baseline supported',
      status: 'stable',
      suggestion: null,
      description: 'This API is part of the Baseline web platform'
    };
  }
}