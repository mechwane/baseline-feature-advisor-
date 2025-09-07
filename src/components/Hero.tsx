import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowRight, Zap, Shield, Code, GitBranch } from "lucide-react";
import CodeScanner from "./CodeScanner";

const Hero = () => {
  const [showScanner, setShowScanner] = useState(false);

  const features = [
    {
      id: "baseline-safety",
      icon: <Shield className="h-5 w-5" />,
      title: "Baseline Safety",
      description: "Detect unsafe web APIs and ensure cross-browser compatibility"
    },
    {
      id: "ai-powered",
      icon: <Zap className="h-5 w-5" />,
      title: "AI-Powered",
      description: "Get intelligent suggestions for modern, compatible alternatives"
    },
    {
      id: "ide-integration",
      icon: <Code className="h-5 w-5" />,
      title: "IDE Integration",
      description: "Real-time warnings and suggestions directly in VSCode"
    },
    {
      id: "cicd-ready",
      icon: <GitBranch className="h-5 w-5" />,
      title: "CI/CD Ready",
      description: "GitHub Actions integration for automated compatibility checks"
    }
  ];

  if (showScanner) {
    return <CodeScanner onBack={() => setShowScanner(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10">
        <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Baseline Advisor
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="animate-glow">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
          <div className="text-center max-w-4xl mx-auto animate-slide-up">
            <Badge variant="outline" className="mb-6 border-primary/20">
              Developer-First Tool
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
              AI-Powered Baseline
              <br />
              Feature Advisor
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Detect unsafe web APIs and get intelligent suggestions for Baseline-compatible alternatives. 
              Integrate seamlessly with your IDE and CI/CD pipeline for safer web development.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 group"
                onClick={() => setShowScanner(true)}
              >
                Try Code Scanner
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-primary/20 hover:border-primary/40" asChild>
                <Link to="/documentation">View Documentation</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center hover:shadow-card transition-all duration-300 group cursor-pointer"
                  onClick={() => {
                    const element = document.getElementById(feature.id);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Feature Detail Sections */}
            <section id="baseline-safety" className="mt-24 max-w-4xl mx-auto text-left">
              <h2 className="text-2xl font-semibold mb-3">Baseline Safety</h2>
              <p className="text-muted-foreground">Detect unsafe or non‑Baseline web APIs and get safe, widely-supported alternatives with clear fix instructions.</p>
            </section>
            <section id="ai-powered" className="mt-16 max-w-4xl mx-auto text-left">
              <h2 className="text-2xl font-semibold mb-3">AI-Powered</h2>
              <p className="text-muted-foreground">Contextual, AI-generated guidance to modernize your code while preserving behavior.</p>
            </section>
            <section id="ide-integration" className="mt-16 max-w-4xl mx-auto text-left">
              <h2 className="text-2xl font-semibold mb-3">IDE Integration</h2>
              <p className="text-muted-foreground">Get instant feedback inside VSCode with hover details and quick-fix suggestions.</p>
            </section>
            <section id="cicd-ready" className="mt-16 max-w-4xl mx-auto text-left">
              <h2 className="text-2xl font-semibold mb-3">CI/CD Ready</h2>
              <p className="text-muted-foreground">Run automatic scans in GitHub Actions and publish HTML reports for every PR.</p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Hero;