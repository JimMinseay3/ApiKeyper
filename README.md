# ApiKeyper

一个本地的 API Key 集中管理工具，支持桌面应用和浏览器插件。

## 功能特性

- 🔐 集中管理各类 AI 平台的 API Key
- 💾 数据完全本地存储，保护隐私安全
- 🖥️ 支持桌面应用（Electron）
- 🧩 支持浏览器插件版本
- 🔍 快速搜索和复制 API Key
- 📝 支持添加备注和标签
- 🎨 简洁直观的用户界面

## 技术栈

- **桌面应用**: Electron + React + TypeScript
- **浏览器插件**: Chrome Extension + React
- **数据存储**: 本地加密存储
- **UI 框架**: Tailwind CSS

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动桌面应用
npm run dev:electron

# 构建浏览器插件
npm run dev:extension
```

### 构建生产版本

```bash
# 构建桌面应用
npm run build:electron

# 构建浏览器插件
npm run build:extension
```

## 项目结构

```
ApiKeyper/
├── src/
│   ├── main/           # Electron 主进程
│   ├── renderer/       # React 渲染进程（桌面应用）
│   ├── extension/      # 浏览器插件代码
│   ├── shared/         # 共享代码（组件、工具等）
│   └── types/          # TypeScript 类型定义
├── public/             # 静态资源
└── dist/               # 构建输出
```

## 安全说明

- 所有 API Key 使用 AES-256 加密存储
- 数据仅保存在本地，不会上传到任何服务器
- 主密码使用 PBKDF2 进行密钥派生

## 许可证

MIT
