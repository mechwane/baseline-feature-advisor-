interface AISuggestion {
  alternative: string;
  explanation: string;
  codeExample: string;
  browserSupport: string;
}

export class AIAdvisor {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
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

This API is either deprecated or not part of the Baseline web platform. Please provide a JSON response with:
1. "alternative": A modern, Baseline-supported alternative
2. "explanation": Brief explanation of why the original API should be avoided
3. "codeExample": A practical code example showing the replacement
4. "browserSupport": Browser support information for the suggested alternative

Keep the response concise and practical for developers. Format as valid JSON.`;

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
            content: 'You are a helpful web development assistant focused on modern web standards and browser compatibility. Always respond with valid JSON.'
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
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return {
        alternative: parsed.alternative || 'Modern alternative available',
        explanation: parsed.explanation || 'This API has compatibility issues',
        codeExample: parsed.codeExample || '// See documentation for examples',
        browserSupport: parsed.browserSupport || 'Check MDN for browser support'
      };
    } catch {
      // Fallback to text parsing if JSON parsing fails
      return {
        alternative: this.extractSection(response, 'alternative') || 'Modern alternative available',
        explanation: this.extractSection(response, 'explanation') || 'This API has compatibility issues',
        codeExample: this.extractSection(response, 'codeExample') || '// See documentation for examples',
        browserSupport: this.extractSection(response, 'browserSupport') || 'Check MDN for browser support'
      };
    }
  }
  
  private extractSection(text: string, section: string): string {
    const lines = text.split('\n');
    let capturing = false;
    let result = '';
    
    for (const line of lines) {
      if (line.toLowerCase().includes(section.toLowerCase())) {
        capturing = true;
        continue;
      }
      
      if (capturing) {
        if (line.trim() === '' || line.match(/^\d+\./) || line.includes(':')) {
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
        explanation: 'document.execCommand is deprecated and unreliable across browsers. The Clipboard API provides a modern, secure, and promise-based alternative.',
        codeExample: `// Instead of: document.execCommand('copy')
// Use:
await navigator.clipboard.writeText(textToCopy);

// For reading:
const text = await navigator.clipboard.readText();`,
        browserSupport: 'Supported in Chrome 66+, Firefox 63+, Safari 13.1+'
      },
      'webkitRequestAnimationFrame': {
        alternative: 'requestAnimationFrame',
        explanation: 'Vendor-prefixed APIs are no longer needed. The standard requestAnimationFrame is universally supported.',
        codeExample: `// Instead of: webkitRequestAnimationFrame(callback)
// Use:
requestAnimationFrame(callback);`,
        browserSupport: 'Universally supported in all modern browsers'
      },
      'webkitGetUserMedia': {
        alternative: 'navigator.mediaDevices.getUserMedia',
        explanation: 'Legacy getUserMedia is deprecated. The modern API is promise-based and more secure.',
        codeExample: `// Instead of: navigator.webkitGetUserMedia(constraints, success, error)
// Use:
try {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  // Handle stream
} catch (error) {
  // Handle error
}`,
        browserSupport: 'Supported in all modern browsers with HTTPS requirement'
      },
      'webkitURL': {
        alternative: 'URL',
        explanation: 'The vendor-prefixed URL constructor is deprecated. Use the standard URL constructor.',
        codeExample: `// Instead of: new webkitURL(url, base)
// Use:
new URL(url, base);`,
        browserSupport: 'Universally supported in modern browsers'
      },
      'webkitAudioContext': {
        alternative: 'AudioContext',
        explanation: 'Vendor-prefixed AudioContext is deprecated. Use the standard AudioContext.',
        codeExample: `// Instead of: new webkitAudioContext()
// Use:
new AudioContext();`,
        browserSupport: 'Supported in all modern browsers'
      }
    };
    
    return fallbacks[api] || {
      alternative: 'Modern alternative',
      explanation: 'This API may have compatibility issues or be deprecated. Check MDN Web Docs for modern alternatives.',
      codeExample: '// Check MDN documentation for modern alternatives and examples',
      browserSupport: 'Varies - check browser compatibility tables on MDN'
    };
  }
}