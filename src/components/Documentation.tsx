import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Book, 
  Code, 
  Zap, 
  Globe, 
  Database, 
  Brain,
  ArrowRight,
  ExternalLink,
  CheckCircle 
} from "lucide-react";

const Documentation = () => {
  const apiExamples = [
    {
      category: "Deprecated APIs",
      apis: [
        { name: "document.execCommand()", status: "deprecated", alternative: "Clipboard API" },
        { name: "XMLHttpRequest", status: "legacy", alternative: "fetch() API" },
        { name: "navigator.getUserMedia()", status: "deprecated", alternative: "navigator.mediaDevices.getUserMedia()" }
      ]
    },
    {
      category: "Modern Alternatives", 
      apis: [
        { name: "navigator.clipboard.writeText()", status: "baseline", year: "2023" },
        { name: "fetch()", status: "baseline", year: "2017" },
        { name: "navigator.mediaDevices.getUserMedia()", status: "baseline", year: "2021" }
      ]
    }
  ];

  const baselineData = {
    "2023": ["Baseline 2023", "Latest stable features"],
    "2022": ["Baseline 2022", "Widely supported features"],
    "2021": ["Baseline 2021", "Established web standards"]
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guide to using Baseline Feature Advisor for safer, more compatible web development
          </p>
        </div>

        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="getting-started" className="flex items-center text-xs">
              <Book className="h-3 w-3 mr-1" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="api-reference" className="flex items-center text-xs">
              <Code className="h-3 w-3 mr-1" />
              API Reference
            </TabsTrigger>
            <TabsTrigger value="baseline-data" className="flex items-center text-xs">
              <Database className="h-3 w-3 mr-1" />
              Baseline Data
            </TabsTrigger>
            <TabsTrigger value="ai-features" className="flex items-center text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Book className="h-5 w-5 mr-2 text-primary" />
                    Quick Start Guide
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mr-2">1</div>
                        Web Scanner
                      </h4>
                      <p className="text-muted-foreground mb-3">
                        Start by using our online code scanner to analyze your JavaScript/TypeScript files for compatibility issues.
                      </p>
                      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                        <code className="text-sm">
                          1. Paste your code into the web scanner<br/>
                          2. Click "Scan for Web API Issues"<br/>
                          3. Review detected issues and AI suggestions<br/>
                          4. Download compatibility report
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mr-2">2</div>
                        VSCode Integration
                      </h4>
                      <p className="text-muted-foreground mb-3">
                        Install our VSCode extension for real-time compatibility checking as you code.
                      </p>
                      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                        <code className="text-sm">
                          ext install baseline-feature-advisor<br/>
                          # Or search "Baseline Feature Advisor" in VS Code
                        </code>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mr-2">3</div>
                        CI/CD Pipeline
                      </h4>
                      <p className="text-muted-foreground mb-3">
                        Add automated compatibility checking to your GitHub Actions workflow.
                      </p>
                      <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                        <code className="text-sm">
                          # Add .github/workflows/baseline.yml<br/>
                          # Automatic PR comments with compatibility issues<br/>
                          # Optional: Block merges with unsafe APIs
                        </code>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                  <h4 className="font-medium mb-4 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-warning" />
                    Key Features
                  </h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Real-time API compatibility checking</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>AI-powered alternative suggestions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Web Platform Baseline data integration</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Multi-platform support (Web, IDE, CI/CD)</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                  <h4 className="font-medium mb-4 flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-primary" />
                    Browser Support
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Chrome</span>
                      <Badge variant="outline" className="border-accent/20 text-accent text-xs">114+</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Firefox</span>
                      <Badge variant="outline" className="border-accent/20 text-accent text-xs">111+</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Safari</span>
                      <Badge variant="outline" className="border-accent/20 text-accent text-xs">16.4+</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Edge</span>
                      <Badge variant="outline" className="border-accent/20 text-accent text-xs">114+</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api-reference">
            <div className="space-y-8">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h3 className="text-xl font-semibold mb-6">Detected API Categories</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {apiExamples.map((category, index) => (
                    <div key={index}>
                      <h4 className="font-medium mb-4 text-lg">{category.category}</h4>
                      <div className="space-y-3">
                        {category.apis.map((api, apiIndex) => (
                          <div key={apiIndex} className="border border-border/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono">{api.name}</code>
                              <Badge 
                                variant={api.status === 'baseline' ? 'default' : 'destructive'}
                                className={api.status === 'baseline' ? 'border-accent/20 text-accent' : ''}
                              >
                                {api.status}
                                {api.year && ` ${api.year}`}
                              </Badge>
                            </div>
                            {api.alternative && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Alternative:</strong> {api.alternative}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h3 className="text-xl font-semibold mb-4">Command Line Interface</h3>
                <div className="space-y-4">
                  <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Basic Usage</h4>
                    <code className="text-sm">
                      baseline-scan --src ./src --format json --output report.json
                    </code>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Options</h4>
                      <div className="text-sm space-y-1 font-mono">
                        <div><code>--src</code> - Source directory</div>
                        <div><code>--format</code> - Output format (json|markdown)</div>
                        <div><code>--output</code> - Output file path</div>
                        <div><code>--strict</code> - Fail on any issues</div>
                        <div><code>--baseline-year</code> - Target Baseline year</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Examples</h4>
                      <div className="text-xs space-y-1 font-mono text-muted-foreground">
                        <div>baseline-scan --src ./src</div>
                        <div>baseline-scan --strict --baseline-year 2023</div>
                        <div>baseline-scan --format markdown</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="baseline-data">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-primary" />
                  Web Platform Baseline
                </h3>
                
                <p className="text-muted-foreground mb-6">
                  We use official Web Platform Baseline data to determine browser compatibility and feature stability across the web ecosystem.
                </p>

                <div className="space-y-4">
                  {Object.entries(baselineData).map(([year, [title, description]]) => (
                    <div key={year} className="border border-border/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{title}</h4>
                        <Badge variant="outline" className="border-primary/20">{year}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline"
                    className="w-full border-primary/20 hover:border-primary/40"
                    onClick={() => window.open('https://web-platform-dx.github.io/web-features/', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Official Baseline Data
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h3 className="text-xl font-semibold mb-4">Data Sources</h3>
                
                <div className="space-y-4">
                  <div className="border border-border/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Code className="h-4 w-4 mr-2" />
                      web-features npm package
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Official npm package containing structured data about web platform features and their baseline status.
                    </p>
                    <code className="text-xs bg-muted/50 px-2 py-1 rounded">
                      npm install web-features
                    </code>
                  </div>

                  <div className="border border-border/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Web Platform Dashboard API
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Real-time browser compatibility data from the official Web Platform Dashboard.
                    </p>
                    <code className="text-xs bg-muted/50 px-2 py-1 rounded">
                      https://web-platform-dx.github.io/web-features/
                    </code>
                  </div>

                  <div className="border border-border/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      MDN Browser Compat Data
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Comprehensive browser compatibility data maintained by Mozilla and the web community.
                    </p>
                    <code className="text-xs bg-muted/50 px-2 py-1 rounded">
                      @mdn/browser-compat-data
                    </code>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-features">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  AI-Powered Suggestions
                </h3>
                
                <p className="text-muted-foreground mb-6">
                  Our AI analyzes your code patterns and provides intelligent, contextual suggestions for modernizing deprecated APIs.
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Smart Code Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Understands code context and usage patterns to provide more accurate suggestions than simple find-and-replace tools.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Contextual Recommendations</h4>
                    <p className="text-sm text-muted-foreground">
                      Takes into account your specific use case, error handling needs, and browser support requirements.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Learning from Best Practices</h4>
                    <p className="text-sm text-muted-foreground">
                      Trained on modern web development patterns and community best practices for optimal suggestions.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <h3 className="text-xl font-semibold mb-4">Example AI Suggestions</h3>
                
                <div className="space-y-6">
                  <div className="border border-border/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-destructive">Unsafe API Detected</h4>
                    <code className="text-sm bg-muted/50 px-2 py-1 rounded block mb-3">
                      document.execCommand('copy', false, text);
                    </code>
                    
                    <h4 className="font-medium mb-2 text-accent">AI Suggestion</h4>
                    <div className="bg-muted/30 border border-border/50 rounded p-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Modern Alternative:</strong> Clipboard API (Baseline 2023)
                      </p>
                      <code className="text-sm">
                        await navigator.clipboard.writeText(text);
                      </code>
                      <p className="text-xs text-muted-foreground mt-2">
                        ✅ Better error handling, async support, more secure
                      </p>
                    </div>
                  </div>

                  <div className="border border-border/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-warning">Legacy Pattern</h4>
                    <code className="text-sm bg-muted/50 px-2 py-1 rounded block mb-3">
                      var xhr = new XMLHttpRequest();
                    </code>
                    
                    <h4 className="font-medium mb-2 text-accent">AI Enhancement</h4>
                    <div className="bg-muted/30 border border-border/50 rounded p-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Modern Pattern:</strong> fetch() API with proper error handling
                      </p>
                      <code className="text-sm">
                        const response = await fetch(url);<br/>
                        const data = await response.json();
                      </code>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Try our web scanner or integrate with your development workflow today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                Try Code Scanner
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="outline"
                className="border-primary/20 hover:border-primary/40"
              >
                View Integration Guides
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Documentation;