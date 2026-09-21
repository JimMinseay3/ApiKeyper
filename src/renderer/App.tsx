import React, { useState, useEffect } from 'react'
import { ApiKey } from '@/types'
import { StorageService } from '@/shared/storage'
import { Lock, Plus, Search, Copy, Trash2, Edit, Eye, EyeOff } from 'lucide-react'

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [error, setError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    setIsFirstTime(!StorageService.hasMasterPassword())
  }, [])

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
        } catch (err) {
          setError('解密失败，密码可能不正确')
        }
      } else {
        setError('密码错误')
      }
    }
  }

  const handleSaveKey = async (keyData: Partial<ApiKey>) => {
    const newKey: ApiKey = {
      id: editingKey?.id || Date.now().toString(),
      name: keyData.name || '',
      platform: keyData.platform || '',
      key: keyData.key || '',
      note: keyData.note || '',
      tags: keyData.tags || [],
      createdAt: editingKey?.createdAt || Date.now(),
      updatedAt: Date.now()
    }

    const updatedKeys = editingKey
      ? keys.map(k => k.id === editingKey.id ? newKey : k)
      : [...keys, newKey]

    await StorageService.saveKeys(updatedKeys, currentPassword)
    setKeys(updatedKeys)
    setShowAddModal(false)
    setEditingKey(null)
  }

  const handleDeleteKey = async (id: string) => {
    if (confirm('确定要删除这个 API Key 吗？')) {
      const updatedKeys = keys.filter(k => k.id !== id)
      await StorageService.saveKeys(updatedKeys, currentPassword)
      setKeys(updatedKeys)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredKeys = keys.filter(k =>
    k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">API Key 管理</h1>
            <button
              onClick={() => {
                setEditingKey(null)
                setShowAddModal(true)
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加 Key
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索平台名称、标签..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredKeys.map(key => (
            <div key={key.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{key.platform}</p>

                  <div className="flex items-center gap-2 mb-2">
                    <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm font-mono text-gray-700 overflow-hidden">
                      {showPassword[key.id] ? key.key : '•'.repeat(32)}
                    </code>
                    <button
                      onClick={() => togglePasswordVisibility(key.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={showPassword[key.id] ? '隐藏' : '显示'}
                    >
                      {showPassword[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.key)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="复制"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {key.note && (
                    <p className="text-sm text-gray-600 mb-2">{key.note}</p>
                  )}

                  {key.tags && key.tags.length > 0 && (
                    <div className="flex gap-2">
                      {key.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setEditingKey(key)
                      setShowAddModal(true)
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredKeys.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? '没有找到匹配的 API Key' : '还没有添加任何 API Key'}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddKeyModal
          key={editingKey?.id || 'new'}
          initialData={editingKey}
          onSave={handleSaveKey}
          onClose={() => {
            setShowAddModal(false)
            setEditingKey(null)
          }}
        />
      )}
    </div>
  )
}

interface AddKeyModalProps {
  initialData: ApiKey | null
  onSave: (data: Partial<ApiKey>) => void
  onClose: () => void
}

function AddKeyModal({ initialData, onSave, onClose }: AddKeyModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    platform: initialData?.platform || '',
    key: initialData?.key || '',
    note: initialData?.note || '',
    tags: initialData?.tags?.join(', ') || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? '编辑 API Key' : '添加 API Key'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">平台</label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="例如: OpenAI, Anthropic"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注（可选）</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标签（可选，逗号分隔）</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="例如: AI, 生产环境"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default App
