import React, { useState, useEffect } from 'react'
import { ApiKey, MenuItem, Settings } from '@/types'
import { StorageService } from '@/shared/storage'
import { Lock, Plus, Search, Copy, Trash2, Edit, Eye, EyeOff, Key, Star, FolderTree, Download, Upload, Settings as SettingsIcon, Info, Menu, X } from 'lucide-react'
import KeysView from './components/KeysView'
import SettingsView from './components/SettingsView'
import AboutView from './components/AboutView'

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [error, setError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [currentView, setCurrentView] = useState<MenuItem>('keys')
  const [settings, setSettings] = useState<Settings>(StorageService.getSettings())
  const [lastActivityTime, setLastActivityTime] = useState(Date.now())
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    setIsFirstTime(!StorageService.hasMasterPassword())
  }, [])

  // 自动锁定功能
  useEffect(() => {
    if (!isUnlocked || !settings.autoLock || settings.passwordExpiry === 0) return

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = (now - lastActivityTime) / 1000 / 60 // 转换为分钟

      if (elapsed >= settings.passwordExpiry) {
        handleLock()
      }
    }, 10000) // 每 10 秒检查一次

    return () => clearInterval(interval)
  }, [isUnlocked, settings, lastActivityTime])

  // 更新活动时间
  useEffect(() => {
    const updateActivity = () => setLastActivityTime(Date.now())

    if (isUnlocked) {
      window.addEventListener('mousemove', updateActivity)
      window.addEventListener('keydown', updateActivity)
      window.addEventListener('click', updateActivity)

      return () => {
        window.removeEventListener('mousemove', updateActivity)
        window.removeEventListener('keydown', updateActivity)
        window.removeEventListener('click', updateActivity)
      }
    }
  }, [isUnlocked])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isFirstTime) {
      if (password !== confirmPassword) {
        setError('两次密码输入不一致')
        return
      }
      if (password.length < 6) {
        setError('密码长度至少为 6 位')
        return
      }
      await StorageService.setMasterPassword(password)
      setIsUnlocked(true)
      setCurrentPassword(password)
      setKeys([])
    } else {
      const isValid = await StorageService.verifyMasterPassword(password)
      if (isValid) {
        try {
          const loadedKeys = await StorageService.loadKeys(password)
          setKeys(loadedKeys)
          setIsUnlocked(true)
          setCurrentPassword(password)
          setLastActivityTime(Date.now())
        } catch (err) {
          setError('解密失败，密码可能不正确')
        }
      } else {
        setError('密码错误')
      }
    }
  }

  const handleLock = () => {
    setIsUnlocked(false)
    setCurrentPassword('')
    setPassword('')
    setKeys([])
  }

  const handleSaveKeys = async (updatedKeys: ApiKey[]) => {
    await StorageService.saveKeys(updatedKeys, currentPassword)
    setKeys(updatedKeys)
  }

  const handleSettingsChange = (newSettings: Settings) => {
    StorageService.saveSettings(newSettings)
    setSettings(newSettings)
  }

  const menuItems = [
    { id: 'keys' as MenuItem, label: 'API Keys', icon: Key },
    { id: 'favorites' as MenuItem, label: '收藏夹', icon: Star },
    { id: 'categories' as MenuItem, label: '分类管理', icon: FolderTree },
    { id: 'import-export' as MenuItem, label: '导入/导出', icon: Upload },
    { id: 'settings' as MenuItem, label: '系统设置', icon: SettingsIcon },
    { id: 'about' as MenuItem, label: '关于', icon: Info },
  ]

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-100 p-4 rounded-full">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">ApiKeyper</h1>
          <p className="text-gray-600 text-center mb-6">
            {isFirstTime ? '设置主密码' : '输入主密码解锁'}
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isFirstTime ? '设置密码' : '主密码'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="输入密码"
                required
              />
            </div>

            {isFirstTime && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  确认密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="再次输入密码"
                  required
                />
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {isFirstTime ? '创建密码' : '解锁'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 侧边栏 */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex-shrink-0`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Lock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ApiKeyper</h1>
                <p className="text-xs text-gray-500">安全管理工具</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLock}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Lock className="w-5 h-5" />
              <span className="font-medium">锁定</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {menuItems.find(item => item.id === currentView)?.label}
          </h2>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto">
          {currentView === 'keys' && (
            <KeysView
              keys={keys}
              onSaveKeys={handleSaveKeys}
              currentPassword={currentPassword}
            />
          )}
          {currentView === 'favorites' && (
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>收藏夹功能即将推出</p>
              </div>
            </div>
          )}
          {currentView === 'categories' && (
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <FolderTree className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>分类管理功能即将推出</p>
              </div>
            </div>
          )}
          {currentView === 'import-export' && (
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>导入/导出功能即将推出</p>
              </div>
            </div>
          )}
          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          )}
          {currentView === 'about' && <AboutView />}
        </div>
      </div>
    </div>
  )
}

export default App
