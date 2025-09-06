import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Download, 
  GitBranch, 
  Settings, 
  Play,
  Copy,
  ExternalLink 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IntegrationGuides = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description,
    });
  };

  const vscodeExtensionCode = `{
  "name": "baseline-advisor",
  "displayName": "Baseline Feature Advisor",
  "description": "AI-powered web API compatibility checker",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.60.0"
  },
  "categories": ["Linters"],
  "activationEvents": ["onLanguage:javascript", "onLanguage:typescript"],
  "main": "./out/extension.js",
  "contributes": {
    "configuration": {
      "title": "Baseline Advisor",
      "properties": {
        "baselineAdvisor.enableRealTimeChecks": {
          "type": "boolean",
          "default": true,
          "description": "Enable real-time API compatibility checks"
        }
      }
    }
  }
}`;

  const githubActionCode = `name: Baseline Feature Check
on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  baseline-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Baseline Advisor
        run: npm install -g baseline-feature-advisor
        
      - name: Run Baseline Scan
        run: |
          baseline-scan --src ./src --format json --output baseline-report.json
          
      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('baseline-report.json', 'utf8'));
            
            let comment = \`## 🛡️ Baseline Feature Advisor Report
            
            **Summary:**
            - 🔍 APIs Analyzed: \${report.totalAPIs}
            - ⚠️ Unsafe APIs: \${report.unsafeAPIs}
            - 💡 Suggestions: \${report.suggestions}\`;
            
            if (report.issues.length > 0) {
              comment += \`
              
            **Issues Found:**\`;
              report.issues.forEach(issue => {
                comment += \`
            - **\${issue.api}** (Line \${issue.line}): \${issue.description}\`;
              });
            }
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });`;

  const extensionMainCode = `import * as vscode from 'vscode';
import { BaselineChecker } from './baseline-checker';

export function activate(context: vscode.ExtensionContext) {
    const checker = new BaselineChecker();
    
    // Register diagnostics provider
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('baseline-advisor');
    
    // Real-time checking on document change
    const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'javascript' || event.document.languageId === 'typescript') {
            updateDiagnostics(event.document, diagnosticCollection, checker);
        }
    });
    
    // Hover provider for suggestions
    const hoverProvider = vscode.languages.registerHoverProvider(
        { scheme: 'file', language: 'javascript' },
        {
            provideHover(document, position) {
                const range = document.getWordRangeAtPosition(position);
                const word = document.getText(range);
                
                const suggestion = checker.getSuggestion(word);
                if (suggestion) {
                    return new vscode.Hover([
                        new vscode.MarkdownString(\`**⚠️ \${suggestion.title}**\`),
                        new vscode.MarkdownString(suggestion.description),
                        new vscode.MarkdownString(\`**💡 Suggestion:** \${suggestion.alternative}\`)
                    ]);
                }
            }
        }
    );
    
    context.subscriptions.push(diagnosticCollection, onDidChangeTextDocument, hoverProvider);
}

function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection, checker: BaselineChecker) {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    const issues = checker.scanCode(text);
    
    issues.forEach(issue => {
        const range = new vscode.Range(
            document.positionAt(issue.start),
            document.positionAt(issue.end)
        );
        
        const diagnostic = new vscode.Diagnostic(
            range,
            issue.message,
            issue.severity === 'error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
        );
        
        diagnostics.push(diagnostic);
    });
    
    collection.set(document.uri, diagnostics);
}`;

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Integration Guides
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete setup guides for integrating Baseline Feature Advisor into your development workflow
          </p>
        </div>

        <Tabs defaultValue="vscode" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="vscode" className="flex items-center">
              <Code className="h-4 w-4 mr-2" />
              VSCode Extension
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center">
              <GitBranch className="h-4 w-4 mr-2" />
              GitHub Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vscode">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Code className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">VSCode Extension</h3>
                    <Badge variant="outline" className="border-primary/20">Real-time checking</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Real-time API compatibility warnings</li>
                      <li>• Hover tooltips with suggestions</li>
                      <li>• Baseline data integration</li>
                      <li>• AI-powered recommendations</li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <h4 className="font-medium mb-3">Installation:</h4>
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                        onClick={() => window.open('https://marketplace.visualstudio.com/items?itemName=baseline-advisor', '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Install from Marketplace
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">Or search "Baseline Feature Advisor" in VS Code</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">package.json</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(vscodeExtensionCode, "VSCode extension configuration copied!")}
                      className="border-primary/20 hover:border-primary/40"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-muted/30 border border-border/50 rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-60">
                    <code>{vscodeExtensionCode}</code>
                  </pre>
                </Card>

                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">extension.ts</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(extensionMainCode, "Extension main code copied!")}
                      className="border-primary/20 hover:border-primary/40"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <pre className="bg-muted/30 border border-border/50 rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-60">
                    <code>{extensionMainCode}</code>
                  </pre>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="github">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-success rounded-lg flex items-center justify-center">
                    <GitBranch className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">GitHub Actions</h3>
                    <Badge variant="outline" className="border-accent/20 text-accent">CI/CD Integration</Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Capabilities:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Automated code scanning on PRs</li>
                      <li>• Compatibility reports in CI logs</li>
                      <li>• PR comments with findings</li>
                      <li>• Blocking mode for unsafe APIs</li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <h4 className="font-medium mb-3">Quick Setup:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                        <span>Create <code>.github/workflows/baseline.yml</code></span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                        <span>Copy the workflow configuration</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                        <span>Commit and push to trigger</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">.github/workflows/baseline.yml</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(githubActionCode, "GitHub Action workflow copied!")}
                    className="border-primary/20 hover:border-primary/40"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-muted/30 border border-border/50 rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-96">
                  <code>{githubActionCode}</code>
                </pre>
              </Card>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h4 className="font-medium mb-3 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuration Options
                </h4>
                <div className="space-y-2 text-sm">
                  <div><code>--strict</code> - Fail build on any unsafe API</div>
                  <div><code>--format json|markdown</code> - Output format</div>
                  <div><code>--baseline-year 2023</code> - Target Baseline year</div>
                  <div><code>--exclude node_modules</code> - Exclude directories</div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h4 className="font-medium mb-3 flex items-center">
                  <Play className="h-4 w-4 mr-2" />
                  Testing Locally
                </h4>
                <div className="space-y-2 text-sm font-mono bg-muted/30 p-3 rounded-lg">
                  <div>npm install -g baseline-feature-advisor</div>
                  <div>baseline-scan --src ./src</div>
                  <div>baseline-scan --help</div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
            <p className="text-muted-foreground mb-6">
              Check out our comprehensive documentation or join our community for support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                className="border-primary/20 hover:border-primary/40"
                onClick={() => window.open('#', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Documentation
              </Button>
              <Button 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                onClick={() => window.open('#', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                GitHub Repository
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntegrationGuides;