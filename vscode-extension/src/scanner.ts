import * as vscode from 'vscode';
import { parse } from 'acorn';
import { simple } from 'acorn-walk';
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
    status: string;
}

interface APIInfo {
    isBaseline: boolean;
    browserSupport: string;
    status: string;
    suggestion?: string;
}

type WebFeature = {
    status?: { baseline?: boolean; baseline_low_date?: any };
    compat_features?: string[];
    [key: string]: any;
};

export class BaselineScanner {
    private nonBaselineAPIs: Map<string, any>;
    
    constructor() {
        this.nonBaselineAPIs = new Map();
        this.loadWebFeatures();
    }
    
    private loadWebFeatures() {
        // Load web-features data and identify non-Baseline APIs
        for (const [featureId, featureRaw] of Object.entries(webFeatures as any)) {
            const feature = featureRaw as WebFeature;
            if (feature.status?.baseline === false || feature.status?.baseline_low_date === undefined) {
                // Extract API names from the feature
                if (feature.compat_features) {
                    feature.compat_features.forEach((apiName: string) => {
                        this.nonBaselineAPIs.set(apiName, {
                            featureId,
                            ...(feature as object),
                            apiName
                        });
                    });
                }
            }
        }
        
        // Add commonly problematic APIs manually
        const manualAPIs = {
            'document.execCommand': {
                suggestion: 'Use the Clipboard API instead',
                status: 'deprecated',
                browserSupport: 'Limited support, use navigator.clipboard'
            },
            'webkitRequestAnimationFrame': {
                suggestion: 'Use requestAnimationFrame instead',
                status: 'deprecated',
                browserSupport: 'Use the standard requestAnimationFrame'
            },
            'mozRequestAnimationFrame': {
                suggestion: 'Use requestAnimationFrame instead',
                status: 'deprecated',
                browserSupport: 'Use the standard requestAnimationFrame'
            },
            'webkitGetUserMedia': {
                suggestion: 'Use navigator.mediaDevices.getUserMedia instead',
                status: 'deprecated',
                browserSupport: 'Use the standard getUserMedia API'
            }
        };
        
        for (const [api, info] of Object.entries(manualAPIs)) {
            this.nonBaselineAPIs.set(api, info);
        }
    }
    
    async scanDocument(document: vscode.TextDocument): Promise<APIIssue[]> {
        const issues: APIIssue[] = [];
        const text = document.getText();
        
        try {
            if (document.languageId === 'javascript' || document.languageId === 'typescript') {
                issues.push(...await this.scanJavaScript(text));
            } else if (document.languageId === 'html') {
                issues.push(...await this.scanHTML(text));
            }
        } catch (error) {
            console.error('Error scanning document:', error);
        }
        
        return issues;
    }
    
    private async scanJavaScript(code: string): Promise<APIIssue[]> {
        const issues: APIIssue[] = [];
        
        try {
            const ast = parse(code, {
                ecmaVersion: 2022,
                sourceType: 'module',
                locations: true
            });
            
            const self = this;
            simple(ast, {
                MemberExpression(node: any) {
                    const apiCall = self.getAPICall(node);
                    if (apiCall && self.nonBaselineAPIs.has(apiCall)) {
                        const apiInfo = self.nonBaselineAPIs.get(apiCall);
                        issues.push({
                            api: apiCall,
                            line: node.loc.start.line,
                            column: node.loc.start.column,
                            type: apiInfo.status === 'deprecated' ? 'deprecated' : 'non-baseline',
                            description: `${apiCall} is not Modern API Mentor-supported`,
                            suggestion: apiInfo.suggestion || 'Consider using a Modern API Mentor-supported alternative',
                            browserSupport: apiInfo.browserSupport || 'Limited browser support',
                            status: apiInfo.status || 'non-baseline'
                        });
                    }
                },
                CallExpression(node: any) {
                    const apiCall = self.getAPICall(node.callee);
                    if (apiCall && self.nonBaselineAPIs.has(apiCall)) {
                        const apiInfo = self.nonBaselineAPIs.get(apiCall);
                        issues.push({
                            api: apiCall,
                            line: node.loc.start.line,
                            column: node.loc.start.column,
                            type: apiInfo.status === 'deprecated' ? 'deprecated' : 'non-baseline',
                            description: `${apiCall} is not Modern API Mentor-supported`,
                            suggestion: apiInfo.suggestion || 'Consider using a Modern API Mentor-supported alternative',
                            browserSupport: apiInfo.browserSupport || 'Limited browser support',
                            status: apiInfo.status || 'non-baseline'
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error parsing JavaScript:', error);
        }
        
        return issues;
    }
    
    private async scanHTML(html: string): Promise<APIIssue[]> {
        const issues: APIIssue[] = [];
        
        // Simple regex-based scanning for HTML
        const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        
        while ((match = scriptRegex.exec(html)) !== null) {
            const scriptContent = match[1];
            const scriptIssues = await this.scanJavaScript(scriptContent);
            
            // Adjust line numbers based on script tag position
            const beforeScript = html.substring(0, match.index);
            const lineOffset = (beforeScript.match(/\n/g) || []).length;
            
            scriptIssues.forEach(issue => {
                issue.line += lineOffset;
                issues.push(issue);
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
    
    async getAPIInfo(apiName: string): Promise<APIInfo | null> {
        const info = this.nonBaselineAPIs.get(apiName);
        if (info) {
            return {
                isBaseline: false,
                browserSupport: info.browserSupport || 'Limited support',
                status: info.status || 'non-baseline',
                suggestion: info.suggestion
            };
        }
        
        return {
            isBaseline: true,
            browserSupport: 'Modern API Mentor supported',
            status: 'stable'
        };
    }
    
    async scanWorkspace(
        progress: vscode.Progress<{ message?: string; increment?: number }>,
        token: vscode.CancellationToken
    ): Promise<{ totalIssues: number; filesWithIssues: number }> {
        const files = await vscode.workspace.findFiles(
            '**/*.{js,ts,html}',
            '**/node_modules/**'
        );
        
        let totalIssues = 0;
        let filesWithIssues = 0;
        
        for (let i = 0; i < files.length; i++) {
            if (token.isCancellationRequested) {
                break;
            }
            
            const file = files[i];
            progress.report({
                message: `Scanning ${file.fsPath}`,
                increment: (100 / files.length)
            });
            
            try {
                const document = await vscode.workspace.openTextDocument(file);
                const issues = await this.scanDocument(document);
                
                if (issues.length > 0) {
                    totalIssues += issues.length;
                    filesWithIssues++;
                    // Update diagnostics for this file
                    const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
                        const range = new vscode.Range(
                            new vscode.Position(issue.line - 1, issue.column),
                            new vscode.Position(issue.line - 1, issue.column + issue.api.length)
                        );
                        
                        return new vscode.Diagnostic(
                            range,
                            `${issue.api} is not Modern API Mentor-supported. ${issue.suggestion}`,
                            vscode.DiagnosticSeverity.Warning
                        );
                    });
                    
                    vscode.languages.createDiagnosticCollection('modernApiMentor')
                        .set(document.uri, diagnostics);
                }
            } catch (error) {
                console.error(`Error scanning ${file.fsPath}:`, error);
            }
        }
        
        return { totalIssues, filesWithIssues };
    }
}