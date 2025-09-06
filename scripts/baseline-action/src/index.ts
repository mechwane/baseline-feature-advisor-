import * as core from '@actions/core';
import * as github from '@actions/github';
import { BaselineScanner } from './scanner';
import { ReportGenerator } from './report-generator';
import { AIAdvisor } from './ai-advisor';
import * as fs from 'fs';
import * as path from 'path';

async function run(): Promise<void> {
  try {
    // Get inputs
    const scanPath = core.getInput('scan-path') || './src';
    const failOnIssues = core.getInput('fail-on-issues') === 'true';
    const generateReport = core.getInput('generate-report') === 'true';
    const aiSuggestions = core.getInput('ai-suggestions') === 'true';
    const openaiApiKey = core.getInput('openai-api-key');
    
    core.info(`🔍 Starting Baseline Feature scan on: ${scanPath}`);
    
    // Initialize scanner and AI advisor
    const scanner = new BaselineScanner();
    const aiAdvisor = aiSuggestions ? new AIAdvisor(openaiApiKey) : null;
    
    // Scan the specified path
    const results = await scanner.scanDirectory(scanPath);
    
    // Enhance results with AI suggestions if enabled
    if (aiAdvisor && results.issues.length > 0) {
      core.info('🤖 Getting AI-powered suggestions...');
      for (const issue of results.issues) {
        try {
          const suggestion = await aiAdvisor.getSuggestion(issue.api, issue.context);
          if (suggestion) {
            issue.aiSuggestion = suggestion;
          }
        } catch (error) {
          core.warning(`Failed to get AI suggestion for ${issue.api}: ${error}`);
        }
      }
    }
    
    // Generate reports
    if (generateReport) {
      const reportGenerator = new ReportGenerator();
      
      // Generate HTML report
      const htmlReport = reportGenerator.generateHTMLReport(results);
      fs.writeFileSync('baseline-scan-report.html', htmlReport);
      core.info('📄 HTML report generated: baseline-scan-report.html');
      
      // Generate markdown summary for PR comments
      const markdownSummary = reportGenerator.generateMarkdownSummary(results);
      fs.writeFileSync('baseline-scan-summary.md', markdownSummary);
      core.info('📝 Markdown summary generated: baseline-scan-summary.md');
    }
    
    // Set outputs
    core.setOutput('issues-found', results.issues.length > 0 ? 'true' : 'false');
    core.setOutput('total-issues', results.issues.length.toString());
    core.setOutput('report-path', 'baseline-scan-report.html');
    
    // Log summary
    core.info(`\n📊 Scan Summary:`);
    core.info(`   Files scanned: ${results.filesScanned}`);
    core.info(`   Issues found: ${results.issues.length}`);
    core.info(`   Files with issues: ${results.filesWithIssues}`);
    
    if (results.issues.length > 0) {
      core.warning(`⚠️ Found ${results.issues.length} non-Baseline API usage(s)`);
      
      // Group issues by type
      const issuesByType = results.issues.reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(issuesByType).forEach(([type, count]) => {
        core.info(`   ${type}: ${count}`);
      });
      
      if (failOnIssues) {
        core.setFailed(`Build failed: Found ${results.issues.length} non-Baseline API usage(s)`);
      }
    } else {
      core.info('✅ No non-Baseline APIs detected!');
    }
    
  } catch (error) {
    core.setFailed(`Action failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

run();