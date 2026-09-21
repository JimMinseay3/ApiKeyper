import React from 'react'
import { Shield, Github, Heart } from 'lucide-react'

export default function AboutView() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ApiKeyper</h1>
          <p className="text-gray-600">版本 0.1.0 MVP</p>
        </div>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">关于项目</h2>
            <p className="leading-relaxed">
              ApiKeyper 是一个本地的 API Key 集中管理工具，旨在帮助开发者安全、便捷地管理各类 AI 平台的 API 密钥。
              所有数据使用 AES-256-GCM 加密算法加密存储在本地，不会上传到任何服务器，充分保护您的隐私安全。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">核心特性</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>🔐 AES-256-GCM 加密存储，主密码保护</li>
              <li>💾 数据完全本地存储，保护隐私安全</li>
              <li>🔍 快速搜索和分类管理</li>
              <li>⚡ 支持桌面应用和浏览器插件</li>
              <li>🎨 简洁直观的用户界面</li>
              <li>🔄 自动锁定功能，防止未授权访问</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">技术栈</h2>
            <div className="flex flex-wrap gap-2">
              {['Electron', 'React', 'TypeScript', 'Tailwind CSS', 'Web Crypto API'].map(tech => (
                <span key={tech} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">开源协议</h2>
            <p className="leading-relaxed">
              本项目采用 MIT 协议开源，欢迎社区贡献代码和提出建议。
            </p>
          </section>

          <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
            <a
              href="https://github.com/JimMinseay3/ApiKeyper"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <Heart className="w-4 h-4" />
              赞助项目
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 pt-4">
            Made with ❤️ by the community
          </p>
        </div>
      </div>
    </div>
  )
}
