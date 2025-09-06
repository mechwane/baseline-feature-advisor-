import { ScanResults, ScanIssue } from './scanner';

export class ReportGenerator {
  generateHTMLReport(results: ScanResults): string {
    const issuesByFile = this.groupIssuesByFile(results.issues);
    const issuesByType = this.groupIssuesByType(results.issues);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baseline Feature Scan Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333; 
            background: #f5f5f5;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            border-radius: 10px; 
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .stat-card { 
            background: white; 
            padding: 20px; 
            border-radius: 10px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 0.9em; }
        .success { color: #22c55e; }
        .warning { color: #f59e0b; }
        .error { color: #ef4444; }
        .section { 
            background: white; 
            margin-bottom: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .section-header { 
            background: #f8fafc; 
            padding: 20px; 
            border-bottom: 1px solid #e2e8f0; 
        }
        .section-header h2 { color: #1e293b; margin-bottom: 5px; }
        .section-content { padding: 20px; }
        .issue { 
            border: 1px solid #e2e8f0; 
            border-radius: 8px; 
            margin-bottom: 20px; 
            overflow: hidden;
        }
        .issue-header { 
            background: #f8fafc; 
            padding: 15px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
        }
        .issue-title { font-weight: 600; color: #1e293b; }
        .issue-badge { 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 0.8em; 
            font-weight: 500;
        }
        .badge-deprecated { background: #fef3c7; color: #92400e; }
        .badge-non-baseline { background: #dbeafe; color: #1d4ed8; }
        .badge-unsafe { background: #fee2e2; color: #dc2626; }
        .issue-content { padding: 15px; }
        .issue-meta { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin-bottom: 15px;
        }
        .meta-item { 
            padding: 10px; 
            background: #f8fafc; 
            border-radius: 6px; 
            border-left: 3px solid #3b82f6;
        }
        .meta-label { font-size: 0.8em; color: #64748b; margin-bottom: 2px; }
        .meta-value { font-weight: 500; }
        .code-block { 
            background: #1e293b; 
            color: #e2e8f0; 
            padding: 15px; 
            border-radius: 6px; 
            overflow-x: auto; 
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
        }
        .ai-suggestion { 
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
        }
        .ai-title { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            font-weight: 600; 
            color: #0c4a6e; 
            margin-bottom: 10px;
        }
        .tab-container { margin-bottom: 20px; }
        .tabs { display: flex; border-bottom: 1px solid #e2e8f0; }
        .tab { 
            padding: 10px 20px; 
            border: none; 
            background: none; 
            cursor: pointer; 
            border-bottom: 2px solid transparent;
        }
        .tab.active { border-bottom-color: #3b82f6; color: #3b82f6; font-weight: 600; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .stats { grid-template-columns: repeat(2, 1fr); }
            .issue-meta { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Baseline Feature Scan Report</h1>
            <p>Generated on ${new Date(results.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number ${results.filesScanned > 0 ? 'success' : 'warning'}">${results.filesScanned}</div>
                <div class="stat-label">Files Scanned</div>
            </div>
            <div class="stat-card">
                <div class="stat-number ${results.issues.length === 0 ? 'success' : 'warning'}">${results.issues.length}</div>
                <div class="stat-label">Issues Found</div>
            </div>
            <div class="stat-card">
                <div class="stat-number ${results.filesWithIssues === 0 ? 'success' : 'warning'}">${results.filesWithIssues}</div>
                <div class="stat-label">Files with Issues</div>
            </div>
            <div class="stat-card">
                <div class="stat-number ${results.issues.length === 0 ? 'success' : 'error'}">${Object.keys(issuesByType).length}</div>
                <div class="stat-label">Issue Types</div>
            </div>
        </div>
        
        ${results.issues.length === 0 ? `
        <div class="section">
            <div class="section-content" style="text-align: center; padding: 40px;">
                <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
                <h2 style="color: #22c55e; margin-bottom: 10px;">All Clear!</h2>
                <p style="color: #666;">No non-Baseline APIs detected in your codebase.</p>
            </div>
        </div>
        ` : `
        <div class="section">
            <div class="section-header">
                <h2>📊 Issues by Type</h2>
            </div>
            <div class="section-content">
                ${Object.entries(issuesByType).map(([type, issues]) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 10px; background: #f8fafc; border-radius: 6px;">
                    <span class="issue-badge badge-${type}">${type}</span>
                    <span style="font-weight: 600;">${issues.length} issues</span>
                </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <div class="section-header">
                <h2>📁 Issues by File</h2>
            </div>
            <div class="section-content">
                <div class="tab-container">
                    <div class="tabs">
                        ${Object.keys(issuesByFile).map((file, index) => `
                        <button class="tab ${index === 0 ? 'active' : ''}" onclick="showTab('${file.replace(/[^a-zA-Z0-9]/g, '_')}')">${file}</button>
                        `).join('')}
                    </div>
                    
                    ${Object.entries(issuesByFile).map(([file, issues], index) => `
                    <div class="tab-content ${index === 0 ? 'active' : ''}" id="${file.replace(/[^a-zA-Z0-9]/g, '_')}">
                        ${issues.map(issue => this.generateIssueHTML(issue)).join('')}
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
        `}
    </div>
    
    <script>
        function showTab(tabId) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabId).classList.add('active');
            
            // Add active class to clicked tab
            event.target.classList.add('active');
        }
    </script>
</body>
</html>`;
  }
  
  generateMarkdownSummary(results: ScanResults): string {
    if (results.issues.length === 0) {
      return `## ✅ Baseline Scan Results

**All clear!** No non-Baseline APIs detected in your codebase.

- **Files scanned**: ${results.filesScanned}
- **Issues found**: 0
- **Status**: 🟢 Baseline compliant

Great job maintaining modern web standards! 🎉`;
    }
    
    const issuesByType = this.groupIssuesByType(results.issues);
    const criticalIssues = results.issues.filter(issue => issue.type === 'deprecated' || issue.type === 'unsafe');
    
    let summary = `## ⚠️ Baseline Scan Results

Found **${results.issues.length} issues** across **${results.filesWithIssues} files**.

### 📊 Summary
- **Files scanned**: ${results.filesScanned}
- **Total issues**: ${results.issues.length}
- **Files with issues**: ${results.filesWithIssues}

### 🏷️ Issues by Type
${Object.entries(issuesByType).map(([type, issues]) => 
  `- **${type}**: ${issues.length} issues`
).join('\n')}

`;
    
    if (criticalIssues.length > 0) {
      summary += `### 🚨 Critical Issues (${criticalIssues.length})

${criticalIssues.slice(0, 5).map(issue => 
  `- \`${issue.api}\` in ${issue.file}:${issue.line} - ${issue.description}`
).join('\n')}

${criticalIssues.length > 5 ? `\n*... and ${criticalIssues.length - 5} more critical issues*\n` : ''}
`;
    }
    
    summary += `
### 💡 Next Steps
1. Review the [full HTML report](baseline-scan-report.html) for detailed information
2. Prioritize fixing deprecated and unsafe APIs
3. Consider using AI-powered suggestions for modern alternatives
4. Set up the GitHub Action to prevent new issues

---
*Generated by [AI-Powered Baseline Feature Advisor](https://github.com/yourusername/baseline-feature-advisor)*`;
    
    return summary;
  }
  
  private generateIssueHTML(issue: ScanIssue): string {
    return `
    <div class="issue">
        <div class="issue-header">
            <span class="issue-title">${issue.api}</span>
            <span class="issue-badge badge-${issue.type}">${issue.type}</span>
        </div>
        <div class="issue-content">
            <div class="issue-meta">
                <div class="meta-item">
                    <div class="meta-label">Location</div>
                    <div class="meta-value">Line ${issue.line}, Column ${issue.column}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Browser Support</div>
                    <div class="meta-value">${issue.browserSupport}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Suggestion</div>
                    <div class="meta-value">${issue.suggestion}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div class="meta-label">Code Context:</div>
                <div class="code-block">${this.escapeHtml(issue.context)}</div>
            </div>
            
            ${issue.aiSuggestion ? `
            <div class="ai-suggestion">
                <div class="ai-title">
                    🤖 AI-Powered Suggestion
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Alternative:</strong> ${issue.aiSuggestion.alternative}
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Explanation:</strong> ${issue.aiSuggestion.explanation}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Code Example:</strong>
                </div>
                <div class="code-block">${this.escapeHtml(issue.aiSuggestion.codeExample)}</div>
                <div style="margin-top: 10px; font-size: 0.9em; color: #0c4a6e;">
                    <strong>Browser Support:</strong> ${issue.aiSuggestion.browserSupport}
                </div>
            </div>
            ` : ''}
        </div>
    </div>`;
  }
  
  private groupIssuesByFile(issues: ScanIssue[]): Record<string, ScanIssue[]> {
    return issues.reduce((acc, issue) => {
      const fileName = issue.file.split('/').pop() || issue.file;
      if (!acc[fileName]) acc[fileName] = [];
      acc[fileName].push(issue);
      return acc;
    }, {} as Record<string, ScanIssue[]>);
  }
  
  private groupIssuesByType(issues: ScanIssue[]): Record<string, ScanIssue[]> {
    return issues.reduce((acc, issue) => {
      if (!acc[issue.type]) acc[issue.type] = [];
      acc[issue.type].push(issue);
      return acc;
    }, {} as Record<string, ScanIssue[]>);
  }
  
  private escapeHtml(text: string): string {
    const div = { innerHTML: '' } as any;
    div.textContent = text;
    return div.innerHTML;
  }
}