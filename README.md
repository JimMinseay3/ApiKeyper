# ApiKeyper 🔐

<div align="center">

![ApiKeyper Logo](https://img.shields.io/badge/ApiKeyper-v1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-Latest-47848F?style=for-the-badge&logo=electron)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

**安全、本地、开源的 API Key 管理工具**

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [使用说明](#-使用说明) • [技术栈](#-技术栈) • [开发指南](#-开发指南)

</div>

---

## 📖 简介

ApiKeyper 是一款专为开发者设计的 API Key 管理工具。由于很多 AI 网站的 API Key 只显示一次，管理这些密钥变得尤为重要。ApiKeyper 提供了安全、便捷的本地化管理方案。

### 为什么选择 ApiKeyper？

- 🔒 **AES-256 加密** - 军事级别的数据加密
- 💾 **本地存储** - 数据永不离开你的设备
- 🌓 **深色模式** - 保护你的眼睛
- ⌨️ **快捷键** - 提升操作效率
- 📱 **响应式设计** - 完美适配各种屏幕
- 🎨 **现代化 UI** - 简洁优雅的用户界面
- 🚀 **零依赖网络** - 完全离线工作

---

## ✨ 功能特性

### 核心功能

- ✅ **API Key 管理**
  - 添加、编辑、删除密钥
  - 分类和标签管理
  - 收藏重要密钥
  - 快速搜索和过滤

- ✅ **安全保护**
  - 主密码保护
  - AES-256 加密存储
  - 自动锁定机制
  - 复制后自动清空剪贴板

- ✅ **批量操作**
  - 多选复选框
  - 批量删除
  - 全选/取消全选

- ✅ **导入导出**
  - JSON 格式导入
  - 加密/明文导出选项
  - 备份和迁移

### 高级特性

- ⌨️ **键盘快捷键**
  - `Ctrl/Cmd + F` - 聚焦搜索框
  - `Ctrl/Cmd + N` - 添加新 Key
  - `Ctrl/Cmd + L` - 锁定应用

- 🌓 **深色模式**
  - 浅色/深色/跟随系统
  - 所有组件完整适配
  - 平滑主题切换

- 🎉 **Toast 通知**
  - 成功/错误/信息/警告
  - 优雅的动画效果
  - 自动消失

---

## 🚀 快速开始

### 下载安装

#### Windows
```bash
# 下载最新版本
# Coming soon: GitHub Releases
```

#### macOS
```bash
# 下载最新版本
# Coming soon: GitHub Releases
```

#### Linux
```bash
# 下载最新版本
# Coming soon: GitHub Releases
```

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/JimMinseay3/ApiKeyper.git
cd ApiKeyper

# 安装依赖
npm install

# 开发模式运行
npm run dev:electron

# 构建应用
npm run build:electron
```

---

## 📚 使用说明

### 首次启动

1. **设置主密码**
   - 首次启动时设置一个安全的主密码
   - 主密码用于加密你的所有数据
   - 请务必记住这个密码，忘记将无法恢复数据

2. **添加第一个 API Key**
   - 点击"添加 Key"按钮
   - 填写平台名称、API Key、备注等信息
   - 可以添加标签和分类便于管理

### 日常使用

#### 搜索和过滤
- 使用顶部搜索框快速查找
- 使用分类过滤器按分类查看
- 支持搜索平台名称、标签等

#### 复制 API Key
- 点击复制按钮一键复制
- 30 秒后自动清空剪贴板（安全特性）
- 支持显示/隐藏密钥

#### 批量操作
- 勾选多个密钥进行批量操作
- 支持批量删除
- 全选/取消全选快速选择

#### 收藏和分类
- 星标收藏重要的密钥
- 在"收藏夹"页面查看所有收藏
- 在"分类"页面管理分类

---

## 🛠 技术栈

### 前端
- **React 18** - UI 框架
- **TypeScript 5** - 类型安全
- **Tailwind CSS** - 样式框架
- **Vite** - 构建工具
- **Lucide React** - 图标库

### 桌面端
- **Electron** - 跨平台桌面应用框架
- **Electron Builder** - 打包工具

### 数据和安全
- **CryptoJS** - AES-256 加密
- **LocalStorage** - 本地数据存储

---

## 💻 开发指南

### 项目结构

```
ApiKeyper/
├── src/
│   ├── main/              # Electron 主进程
│   │   └── main.ts
│   ├── renderer/          # React 渲染进程
│   │   ├── components/    # React 组件
│   │   ├── App.tsx        # 主应用组件
│   │   └── main.tsx       # 入口文件
│   ├── shared/            # 共享代码
│   │   ├── storage.ts     # 存储服务
│   │   ├── encryption.ts  # 加密服务
│   │   ├── ThemeContext.tsx
│   │   ├── ToastContext.tsx
│   │   └── KeyboardContext.tsx
│   └── types/             # TypeScript 类型定义
│       └── index.ts
├── public/                # 静态资源
├── dist/                  # 构建输出
└── release/               # 打包输出
```

### 可用脚本

```bash
# 开发
npm run dev              # 启动 Vite 开发服务器
npm run dev:electron     # 启动 Electron 开发模式

# 构建
npm run build            # 构建前端和主进程
npm run build:renderer   # 仅构建前端
npm run build:main       # 仅构建主进程
npm run build:electron   # 打包 Electron 应用

# 浏览器扩展（计划中）
npm run build:extension  # 构建浏览器扩展
```

### 开发规范

- 使用 TypeScript 严格模式
- 遵循 React Hooks 最佳实践
- 使用 Context API 进行状态管理
- 组件化开发，保持组件单一职责
- 代码注释清晰明了

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🙏 致谢

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Vite](https://vitejs.dev/)

---

<div align="center">

**如果觉得有用，请给个 ⭐️ Star！**

Made with ❤️ by developers, for developers

</div>
