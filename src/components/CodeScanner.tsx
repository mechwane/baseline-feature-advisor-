import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Scan, AlertTriangle, CheckCircle, Lightbulb, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ScanResults from "./ScanResults";

interface CodeScannerProps {
  onBack: () => void;
}

const CodeScanner = ({ onBack }: CodeScannerProps) => {
  const [code, setCode] = useState(`// Example: Paste your JavaScript/TypeScript code here
document.execCommand('copy', false, text);
navigator.geolocation.getCurrentPosition();
document.cookie = "test=value";
fetch('/api/data').then(response => response.json());`);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const mockScanResults = {
    totalAPIs: 4,
    unsafeAPIs: 2,
    warnings: 1,
    safe: 1,
    issues: [
      {
        type: "unsafe",
        api: "document.execCommand()",
        line: 2,
        description: "Deprecated API with limited browser support",
        suggestion: {
          modern: "Clipboard API",
          code: `await navigator.clipboard.writeText(text);`,
          support: "Baseline 2023 (Chrome 114+, Firefox 111+, Safari 16.4+)"
        }
      },
      {
        type: "warning",
        api: "navigator.geolocation.getCurrentPosition()",
        line: 3,
        description: "Requires HTTPS in modern browsers",
        suggestion: {
          modern: "Same API with proper error handling",
          code: `navigator.geolocation.getCurrentPosition(
  position => console.log(position),
  error => console.error('Geolocation error:', error),
  { enableHighAccuracy: true }
);`,
          support: "Baseline ✓ (Widely supported with HTTPS)"
        }
      },
      {
        type: "unsafe",
        api: "document.cookie",
        line: 4,
        description: "Direct cookie manipulation, consider modern alternatives",
        suggestion: {
          modern: "Cookie Store API (or library)",
          code: `// Modern approach with proper attributes
document.cookie = \`test=value; SameSite=Strict; Secure; HttpOnly\`;

// Or use Cookie Store API where available
if ('cookieStore' in window) {
  await cookieStore.set('test', 'value');
}`,
          support: "Cookie Store API: Limited support, use with polyfill"
        }
      }
    ]
  };

  const handleScan = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to scan",
        description: "Please enter some JavaScript or TypeScript code to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResults(mockScanResults);
    setIsScanning(false);
    
    toast({
      title: "Scan complete!",
      description: `Found ${mockScanResults.unsafeAPIs} unsafe APIs and ${mockScanResults.warnings} warnings.`,
    });
  };

  const handleCopyExample = () => {
    const exampleCode = `// Modern JavaScript examples to test
document.execCommand('copy', false, 'test');
navigator.geolocation.getCurrentPosition();
document.cookie = "session=abc123";
localStorage.setItem('user', 'data');
fetch('/api/endpoint').then(r => r.json());
new XMLHttpRequest();
window.btoa('encode this');
new Date().toISOString();`;
    
    setCode(exampleCode);
    toast({
      title: "Example loaded",
      description: "Try scanning this example code to see how it works!",
    });
  };

  if (results) {
    return <ScanResults results={results} onNewScan={() => setResults(null)} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="hover:bg-secondary/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-primary/20">
              <Scan className="h-3 w-3 mr-1" />
              Code Scanner
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Code Input</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyExample}
                className="border-primary/20 hover:border-primary/40"
              >
                <Copy className="h-3 w-3 mr-1" />
                Load Example
              </Button>
            </div>
            
            <div className="space-y-4">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your JavaScript or TypeScript code here..."
                className="min-h-[400px] font-mono text-sm bg-muted/30 border-border/50 focus:border-primary/40"
              />
              
              <Button 
                onClick={handleScan}
                disabled={isScanning}
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                size="lg"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                    Analyzing Code...
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4 mr-2" />
                    Scan for Web API Issues
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Info Section */}
          <div className="space-y-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-warning" />
                What We Check
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Deprecated APIs</strong>
                    <p className="text-muted-foreground">APIs that are no longer recommended or supported</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Baseline Compatibility</strong>
                    <p className="text-muted-foreground">Cross-browser support using Web Platform Baseline data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Modern Alternatives</strong>
                    <p className="text-muted-foreground">AI-powered suggestions for better implementations</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold mb-4">Supported Integrations</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium">IDE</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• VSCode Extension</li>
                    <li>• Real-time warnings</li>
                    <li>• Hover tooltips</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">CI/CD</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• GitHub Actions</li>
                    <li>• PR comments</li>
                    <li>• Build reports</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeScanner;