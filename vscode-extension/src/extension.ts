import * as vscode from 'vscode';
import { BaselineScanner } from './scanner';
import { AIAdvisor } from './aiAdvisor';

let scanner: BaselineScanner;
let aiAdvisor: AIAdvisor;

export function activate(context: vscode.ExtensionContext) {
    console.log('Baseline Feature Advisor is now active!');
    
    scanner = new BaselineScanner();
    aiAdvisor = new AIAdvisor();
    
    // Register commands
    const scanFileCommand = vscode.commands.registerCommand('baselineAdvisor.scanFile', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('No active file to scan');
            return;
        }
        
        const document = activeEditor.document;
        const issues = await scanner.scanDocument(document);
        
        if (issues.length === 0) {
            vscode.window.showInformationMessage('✅ No non-Baseline APIs detected!');
        } else {
            vscode.window.showWarningMessage(`⚠️ Found ${issues.length} potential issues`);
            // Show issues in problems panel
            updateDiagnostics(document, issues);
        }
    });
    
    const scanWorkspaceCommand = vscode.commands.registerCommand('baselineAdvisor.scanWorkspace', async () => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Scanning workspace for non-Baseline APIs...",
            cancellable: true
        }, async (progress, token) => {
            const workspaceResults = await scanner.scanWorkspace(progress, token);
            
            if (workspaceResults.totalIssues === 0) {
                vscode.window.showInformationMessage('✅ Workspace is Baseline-compliant!');
            } else {
                vscode.window.showWarningMessage(
                    `⚠️ Found ${workspaceResults.totalIssues} issues across ${workspaceResults.filesWithIssues} files`
                );
            }
        });
    });
    
    // Real-time scanning on document changes
    const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(async (event) => {
        const config = vscode.workspace.getConfiguration('baselineAdvisor');
        if (!config.get('enableRealTimeScanning')) return;
        
        const document = event.document;
        if (!isRelevantDocument(document)) return;
        
        // Debounce rapid changes
        clearTimeout((global as any).scanTimeout);
        (global as any).scanTimeout = setTimeout(async () => {
            const issues = await scanner.scanDocument(document);
            updateDiagnostics(document, issues);
        }, 1000);
    });
    
    // Hover provider for detailed information
    const hoverProvider = vscode.languages.registerHoverProvider(
        ['javascript', 'typescript', 'html'],
        {
            async provideHover(document, position, token) {
                const range = document.getWordRangeAtPosition(position);
                if (!range) return;
                
                const word = document.getText(range);
                const apiInfo = await scanner.getAPIInfo(word);
                
                if (apiInfo && !apiInfo.isBaseline) {
                    const config = vscode.workspace.getConfiguration('baselineAdvisor');
                    let content = `⚠️ **${word}** is not Baseline-supported\n\n`;
                    content += `**Browser Support:** ${apiInfo.browserSupport}\n`;
                    content += `**Status:** ${apiInfo.status}\n\n`;
                    
                    if (config.get('aiSuggestions') && apiInfo.suggestion) {
                        content += `**AI Suggestion:** ${apiInfo.suggestion}\n`;
                    }
                    
                    return new vscode.Hover(new vscode.MarkdownString(content));
                }
            }
        }
    );
    
    context.subscriptions.push(
        scanFileCommand,
        scanWorkspaceCommand,
        onDidChangeTextDocument,
        hoverProvider
    );
}

function isRelevantDocument(document: vscode.TextDocument): boolean {
    return ['javascript', 'typescript', 'html'].includes(document.languageId);
}

const diagnosticCollection = vscode.languages.createDiagnosticCollection('baselineAdvisor');

function updateDiagnostics(document: vscode.TextDocument, issues: any[]) {
    const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
        const range = new vscode.Range(
            new vscode.Position(issue.line - 1, issue.column),
            new vscode.Position(issue.line - 1, issue.column + issue.api.length)
        );
        
        const diagnostic = new vscode.Diagnostic(
            range,
            `${issue.api} is not Baseline-supported. ${issue.suggestion}`,
            vscode.DiagnosticSeverity.Warning
        );
        
        diagnostic.source = 'Baseline Advisor';
        diagnostic.code = issue.type;
        
        return diagnostic;
    });
    
    diagnosticCollection.set(document.uri, diagnostics);
}

export function deactivate(): void {
    diagnosticCollection.dispose();
}