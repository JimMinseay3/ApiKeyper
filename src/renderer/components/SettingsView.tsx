import React, { useState } from 'react'
import { Settings } from '@/types'
import { FolderOpen, Clock, Shield } from 'lucide-react'

interface SettingsViewProps {
  settings: Settings
  onSettingsChange: (settings: Settings) => void
}

export default function SettingsView({ settings, onSettingsChange }: SettingsViewProps) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    onSettingsChange(localSettings)
    alert('设置已保存')
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-8">
        {/* 存储设置 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FolderOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">存储设置</h3>
              <p className="text-sm text-gray-600">配置数据存储位置</p>
            </div>
          </div>

          <div className="space-y-4 ml-12">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                数据存储路径
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.storagePath}
                  onChange={(e) => setLocalSettings({ ...localSettings, storagePath: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="默认使用浏览器本地存储"
                />
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    // 浏览器环境无法选择文件夹，这里仅作为 UI 展示
                    alert('浏览器版本使用 localStorage，桌面版可选择自定义路径')
                  }}
                >
                  浏览
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                网页版使用浏览器本地存储，桌面版可自定义存储路径
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* 安全设置 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">安全设置</h3>
              <p className="text-sm text-gray-600">配置密码和自动锁定</p>
            </div>
          </div>

          <div className="space-y-6 ml-12">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  自动锁定
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  一段时间无操作后自动锁定应用
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoLock}
                  onChange={(e) => setLocalSettings({ ...localSettings, autoLock: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {localSettings.autoLock && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自动锁定时间（分钟）
                </label>
                <select
                  value={localSettings.passwordExpiry}
                  onChange={(e) => setLocalSettings({ ...localSettings, passwordExpiry: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={0}>从不</option>
                  <option value={5}>5 分钟</option>
                  <option value={10}>10 分钟</option>
                  <option value={15}>15 分钟</option>
                  <option value={30}>30 分钟</option>
                  <option value={60}>1 小时</option>
                  <option value={120}>2 小时</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  超过设定时间无操作后，应用将自动锁定并需要重新输入密码
                </p>
              </div>
            )}
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* 外观设置 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">外观设置</h3>
              <p className="text-sm text-gray-600">配置界面主题和语言</p>
            </div>
          </div>

          <div className="space-y-4 ml-12">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主题
              </label>
              <select
                value={localSettings.theme}
                onChange={(e) => setLocalSettings({ ...localSettings, theme: e.target.value as Settings['theme'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                语言
              </label>
              <select
                value={localSettings.language}
                onChange={(e) => setLocalSettings({ ...localSettings, language: e.target.value as Settings['language'] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>
          </div>
        </section>

        {/* 保存按钮 */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  )
}
