# 📋 Complete Setup Guide

This guide will walk you through setting up the complete AI-Powered Baseline Feature Advisor project.

## 🎯 Overview

The project consists of three main components:
1. **Web Dashboard** - React-based frontend for testing and exploration
2. **VSCode Extension** - Real-time code analysis in your IDE
3. **GitHub Action** - Automated scanning in CI/CD pipelines

## 🚀 Quick Setup (5 minutes)

### 1. Frontend Dashboard

```bash
# Clone and setup
git clone <your-repo-url>
cd baseline-feature-advisor
npm install
npm run dev
```

Visit `http://localhost:8080` to use the web interface.

### 2. VSCode Extension

```bash
cd vscode-extension
npm install
npm run compile

# Package extension
npm install -g vsce
vsce package

# Install in VSCode
code --install-extension baseline-feature-advisor-1.0.0.vsix
```

### 3. GitHub Action

Copy the workflow file to your repository:

```bash
cp .github/workflows/baseline-scan.yml your-project/.github/workflows/
```

## 🔧 Detailed Setup

### Frontend Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   npm run preview
   ```

### VSCode Extension Development

1. **Setup Extension Environment**:
   ```bash
   cd vscode-extension
   npm install
   ```

2. **Development**:
   ```bash
   # Compile TypeScript
   npm run compile

   # Watch for changes
   npm run watch
   ```

3. **Testing**:
   - Press `F5` in VSCode to launch Extension Development Host
   - Test the extension in the new window

4. **Packaging**:
   ```bash
   # Install VSCE (Visual Studio Code Extension manager)
   npm install -g vsce

   # Package extension
   vsce package

   # Publish to marketplace (optional)
   vsce publish
   ```

### GitHub Action Development

1. **Setup Action Environment**:
   ```bash
   cd scripts/baseline-action
   npm install
   ```

2. **Build Action**:
   ```bash
   npm run build
   ```

3. **Test Locally**:
   ```bash
   # Install @vercel/ncc for building
   npm install -g @vercel/ncc

   # Build and package
   npm run package
   ```

## 🔑 API Configuration

### OpenAI API Key (Optional but Recommended)

The AI-powered suggestions require an OpenAI API key:

1. **Get API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key

2. **VSCode Extension**:
   - Open VSCode Settings
   - Search for "Baseline Advisor"
   - Enter your API key in `baselineAdvisor.openaiApiKey`

3. **GitHub Action**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add secret: `OPENAI_API_KEY`

4. **Local Development**:
   - Create `.env` file in project root:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

## 🧪 Testing

### Frontend Testing

```bash
# Run tests
npm test

# Test specific component
npm test -- --testNamePattern="CodeScanner"
```

### Extension Testing

1. **Manual Testing**:
   - Press `F5` in VSCode
   - Test in Extension Development Host

2. **Automated Testing**:
   ```bash
   cd vscode-extension
   npm test
   ```

### Action Testing

1. **Local Testing**:
   ```bash
   cd scripts/baseline-action
   npm test
   ```

2. **Integration Testing**:
   - Create a test repository
   - Add the action workflow
   - Push code with non-Baseline APIs
   - Verify action runs and reports issues

## 📦 Deployment

### Frontend Deployment

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Deploy to Netlify**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

### Extension Publishing

1. **Package**:
   ```bash
   cd vscode-extension
   vsce package
   ```

2. **Publish to Marketplace**:
   ```bash
   vsce publish
   ```

### Action Publishing

1. **Tag Release**:
   ```bash
   git tag -a v1.0.0 -m "First release"
   git push origin v1.0.0
   ```

2. **Marketplace**:
   - Go to GitHub Marketplace
   - Submit your action for review

## 🔧 Configuration Options

### VSCode Extension Settings

```json
{
  "baselineAdvisor.enableRealTimeScanning": true,
  "baselineAdvisor.aiSuggestions": true,
  "baselineAdvisor.openaiApiKey": "your-api-key"
}
```

### GitHub Action Inputs

```yaml
- uses: ./scripts/baseline-action
  with:
    scan-path: './src'           # Path to scan
    fail-on-issues: 'false'      # Fail build on issues
    generate-report: 'true'      # Generate HTML report
    ai-suggestions: 'true'       # Enable AI suggestions
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

## 🐛 Troubleshooting

### Common Issues

1. **Extension Not Loading**:
   ```bash
   # Reinstall extension
   code --uninstall-extension baseline-advisor.baseline-feature-advisor
   code --install-extension baseline-feature-advisor-1.0.0.vsix
   ```

2. **Action Failing**:
   - Check Node.js version (requires 18+)
   - Verify file permissions
   - Check action logs for detailed errors

3. **Frontend Build Issues**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Performance Optimization

1. **Large Codebases**:
   - Exclude node_modules in scanning
   - Use `.gitignore` patterns
   - Increase timeout limits

2. **CI/CD Performance**:
   - Cache dependencies
   - Use faster runners
   - Parallelize scanning

## 📚 Additional Resources

- [VSCode Extension API](https://code.visualstudio.com/api)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Web Features Database](https://github.com/web-platform-dx/web-features)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search [existing issues](https://github.com/yourusername/baseline-feature-advisor/issues)
3. Create a [new issue](https://github.com/yourusername/baseline-feature-advisor/issues/new) with:
   - Environment details
   - Error messages
   - Steps to reproduce

## 🎉 Next Steps

After setup:

1. ✅ Test the web dashboard
2. ✅ Install and configure the VSCode extension
3. ✅ Add the GitHub Action to your projects
4. ✅ Configure AI suggestions with OpenAI API key
5. ✅ Start scanning your codebase for non-Baseline APIs!

Happy coding! 🚀