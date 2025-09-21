import * as vscode from 'vscode';
import { BaselineScanner } from './scanner';
import { AIAdvisor } from './aiAdvisor';

let scanner: BaselineScanner;
let aiAdvisor: AIAdvisor;
const diagnosticCollection = vscode.languages.createDiagnosticCollection('baselineAdvisor');

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Baseline Feature Advisor is now active!');

    scanner = new BaselineScanner();
    aiAdvisor = new AIAdvisor();

    /**
     * Command: Scan the currently active file
     */
    const scanFileCommand = vscode.commands.registerCommand('baselineAdvisor.scanFile', async () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showWarningMessage('No active file to scan.');
            return;
        }

        const document = activeEditor.document;
        const issues = await scanner.scanDocument(document);

        if (issues.length === 0) {
            vscode.window.showInformationMessage('✅ No non-Baseline APIs detected in this file.');
            diagnosticCollection.delete(document.uri);
        } else {
            vscode.window.showWarningMessage(`⚠️ Found ${issues.length} potential issues in this file.`);
            updateDiagnostics(document, issues);
        }
    });

    /**
     * Command: Scan the entire workspace
     */
    const scanWorkspaceCommand = vscode.commands.registerCommand('baselineAdvisor.scanWorkspace', async () => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Scanning workspace for non-Baseline APIs...",
            cancellable: true
        }, async (progress, token) => {
            const results = await scanner.scanWorkspace(progress, token);

            if (results.totalIssues === 0) {
                vscode.window.showInformationMessage('✅ Workspace is Baseline-compliant!');
                diagnosticCollection.clear();
            } else {
                vscode.window.showWarningMessage(
                    `⚠️ Found ${results.totalIssues} issues across ${results.filesWithIssues} files.`
                );
            }
        });
    });

    /**
     * Real-time scanning on document changes (debounced)
     */
    const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(async (event) => {
        const config = vscode.workspace.getConfiguration('baselineAdvisor');
        if (!config.get('enableRealTimeScanning')) return;

        const document = event.document;
        if (!isRelevantDocument(document)) return;

        clearTimeout((global as any).scanTimeout);
        (global as any).scanTimeout = setTimeout(async () => {
            const issues = await scanner.scanDocument(document);
            updateDiagnostics(document, issues);
        }, 800); // debounce: 0.8s
    });

    /**
     * Hover provider: Show details when hovering over problematic APIs
     */
    const hoverProvider = vscode.languages.registerHoverProvider(
        ['javascript', 'typescript', 'html'],
        {
            async provideHover(document, position) {
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

    /**
     * Register disposables
     */
    context.subscriptions.push(
        scanFileCommand,
        scanWorkspaceCommand,
        onDidChangeTextDocument,
        hoverProvider,
        diagnosticCollection
    );
}

/**
 * Helper: Filter only relevant files
 */
function isRelevantDocument(document: vscode.TextDocument): boolean {
    return ['javascript', 'typescript', 'html'].includes(document.languageId);
}

/**
 * Update VSCode Problems panel with diagnostics
 */
function updateDiagnostics(document: vscode.TextDocument, issues: any[]) {
    if (issues.length === 0) {
        diagnosticCollection.delete(document.uri);
        return;
    }

    const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
        const range = new vscode.Range(
            new vscode.Position(Math.max(0, issue.line - 1), Math.max(0, issue.column)),
            new vscode.Position(Math.max(0, issue.line - 1), Math.max(0, issue.column + issue.api.length))
        );

        const diagnostic = new vscode.Diagnostic(
            range,
            `${issue.api} is not Baseline-supported. Suggestion: ${issue.suggestion}`,
            vscode.DiagnosticSeverity.Warning
        );

        diagnostic.source = 'Baseline Advisor';
        diagnostic.code = issue.type;

        return diagnostic;
    });

    diagnosticCollection.set(document.uri, diagnostics);
}

export function deactivate() {
    diagnosticCollection.dispose();
}
