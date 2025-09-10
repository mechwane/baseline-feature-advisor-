# AI-Powered Baseline Feature Advisor

[![Version](https://img.shields.io/visual-studio-marketplace/v/Algma-Tech.baseline-feature-advisor)](https://marketplace.visualstudio.com/items?itemName=Algma-Tech.baseline-feature-advisor)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/Algma-Tech.baseline-feature-advisor)](https://marketplace.visualstudio.com/items?itemName=Algma-Tech.baseline-feature-advisor)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/Algma-Tech.baseline-feature-advisor)](https://marketplace.visualstudio.com/items?itemName=Algma-Tech.baseline-feature-advisor)

⚡ **Baseline Feature Advisor** helps developers detect unsafe or non-standard web APIs in their code and suggests **Baseline-supported, secure alternatives** — powered by AI.

---

## 🚀 Features

- Detects unsafe and non-standard web APIs  
- Scans individual files or entire workspaces  
- Real-time scanning while typing  
- AI-powered suggestions for secure alternatives  
- Works with **JavaScript, TypeScript, and HTML**

---

## 🛠️ Commands

| Command | Description |
|---------|-------------|
| **Baseline Advisor: Scan File** | Scan the active file for non-baseline APIs |
| **Baseline Advisor: Scan Workspace** | Scan the entire workspace |

---

## ⚙️ Configuration

Go to **Settings → Extensions → Baseline Feature Advisor**:

- `baselineAdvisor.enableRealTimeScanning` → Enable/disable real-time scanning  
- `baselineAdvisor.aiSuggestions` → Enable or disable AI-powered suggestions  
- `baselineAdvisor.openaiApiKey` → Your OpenAI API key for suggestions  

---

## 📦 Installation

You can install the extension in two ways:

### From VS Code Marketplace
1. Open **Visual Studio Code**  
2. Go to the **Extensions** sidebar (Ctrl+Shift+X)  
3. Search for **Baseline Feature Advisor**  
4. Click **Install**

### From the command line
Run this command in your terminal:
```bash
code --install-extension Algma-Tech.baseline-feature-advisor
