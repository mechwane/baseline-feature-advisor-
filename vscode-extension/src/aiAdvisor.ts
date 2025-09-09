import * as vscode from 'vscode';
import fetch from 'node-fetch';
interface AISuggestion {
    alternative: string;
    explanation: string;
    codeExample: string;
    browserSupport: string;
}

export class AIAdvisor {
    private apiKey: string | undefined;
    
    constructor() {
        this.updateApiKey();
        
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('baselineAdvisor.openaiApiKey')) {
                this.updateApiKey();
            }
        });
    }
    
    private updateApiKey() {
        const config = vscode.workspace.getConfiguration('baselineAdvisor');
        this.apiKey = config.get('openaiApiKey') as string;
    }
    
    async getSuggestion(api: string, context: string): Promise<AISuggestion | null> {
        if (!this.apiKey) {
            return this.getFallbackSuggestion(api);
        }
        
        try {
            const response = await this.callOpenAI(api, context);
            return this.parseAIResponse(response);
        } catch (error) {
            console.error('Error getting AI suggestion:', error);
            return this.getFallbackSuggestion(api);
        }
    }
    
    private async callOpenAI(api: string, context: string): Promise<string> {
        const prompt = `You are a web development expert specializing in browser compatibility and modern web standards.

API: ${api}
Code Context: ${context}

This API is either deprecated or not part of the Baseline web platform. Please provide:
1. A modern, Baseline-supported alternative
2. Brief explanation of why the original API should be avoided
3. A practical code example showing the replacement
4. Browser support information for the suggested alternative

Keep the response concise and practical for developers.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful web development assistant focused on modern web standards and browser compatibility.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.3,
            }),
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }
    
    private parseAIResponse(response: string): AISuggestion {
        // Simple parsing of AI response
        // In a real implementation, you might want more sophisticated parsing
        return {
            alternative: this.extractSection(response, 'alternative') || 'Modern alternative available',
            explanation: this.extractSection(response, 'explanation') || 'This API has compatibility issues',
            codeExample: this.extractSection(response, 'example') || '// See documentation for examples',
            browserSupport: this.extractSection(response, 'support') || 'Check MDN for browser support'
        };
    }
    
    private extractSection(text: string, section: string): string {
        // Simple extraction - look for patterns in the AI response
        const lines = text.split('\n');
        let capturing = false;
        let result = '';
        
        for (const line of lines) {
            if (line.toLowerCase().includes(section)) {
                capturing = true;
                continue;
            }
            
            if (capturing) {
                if (line.trim() === '' || line.match(/^\d+\./)) {
                    break;
                }
                result += line + '\n';
            }
        }
        
        return result.trim();
    }
    
    private getFallbackSuggestion(api: string): AISuggestion {
        const fallbacks: { [key: string]: AISuggestion } = {
            'document.execCommand': {
                alternative: 'Clipboard API',
                explanation: 'document.execCommand is deprecated and unreliable. Use the modern Clipboard API for better browser support and security.',
                codeExample: `// Instead of: document.execCommand('copy')
// Use:
navigator.clipboard.writeText(text).then(() => {
    console.log('Text copied to clipboard');
});`,
                browserSupport: 'Supported in Chrome 66+, Firefox 63+, Safari 13.1+'
            },
            'webkitRequestAnimationFrame': {
                alternative: 'requestAnimationFrame',
                explanation: 'Vendor-prefixed version is no longer needed. Use the standard requestAnimationFrame.',
                codeExample: `// Instead of: webkitRequestAnimationFrame(callback)
// Use:
requestAnimationFrame(callback);`,
                browserSupport: 'Universally supported in modern browsers'
            },
            'webkitGetUserMedia': {
                alternative: 'navigator.mediaDevices.getUserMedia',
                explanation: 'Legacy getUserMedia is deprecated. Use the modern promise-based API.',
                codeExample: `// Instead of: navigator.webkitGetUserMedia(constraints, success, error)
// Use:
navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        // Handle stream
    })
    .catch(error => {
        // Handle error
    });`,
                browserSupport: 'Supported in all modern browsers'
            }
        };
        
        return fallbacks[api] || {
            alternative: 'Modern alternative',
            explanation: 'This API may have compatibility issues. Check MDN for modern alternatives.',
            codeExample: '// Check MDN documentation for modern alternatives',
            browserSupport: 'Varies - check browser compatibility tables'
        };
    }
}