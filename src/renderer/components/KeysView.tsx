import React, { useState, useRef } from 'react'
import { ApiKey, Settings } from '@/types'
import { Plus, Search, Copy, Trash2, Edit, Eye, EyeOff, Star } from 'lucide-react'
import { useToast } from '@/shared/ToastContext'
import { useShortcut } from '@/shared/KeyboardContext'

interface KeysViewProps {
  keys: ApiKey[]
  settings: Settings
  onSaveKeys: (keys: ApiKey[]) => void
  currentPassword: string
}

export default function KeysView({ keys, settings, onSaveKeys, currentPassword }: KeysViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({})
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const toast = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 快捷键：Ctrl/Cmd + F 聚焦搜索框
  useShortcut({
    key: 'f',
    ctrl: true,
    action: () => searchInputRef.current?.focus(),
    description: '聚焦搜索框'
  })

  // 快捷键：Ctrl/Cmd + N 添加新 Key
  useShortcut({
    key: 'n',
    ctrl: true,
    action: () => {
      setEditingKey(null)
      setShowAddModal(true)
    },
    description: '添加新 API Key'
  })

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

    onSaveKeys(updatedKeys)
    setShowAddModal(false)
    setEditingKey(null)
  }

  const handleDeleteKey = async (id: string) => {
    if (confirm('确定要删除这个 API Key 吗？')) {
      const updatedKeys = keys.filter(k => k.id !== id)
      onSaveKeys(updatedKeys)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('已复制到剪贴板')

      // 30秒后清空剪贴板（安全特性）
      setTimeout(async () => {
        const current = await navigator.clipboard.readText()
        if (current === text) {
          await navigator.clipboard.writeText('')
        }
      }, 30000)
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const handleBatchDelete = () => {
    if (selectedKeys.size === 0) return

    if (confirm(`确定要删除选中的 ${selectedKeys.size} 个 API Key 吗？`)) {
      const updatedKeys = keys.filter(k => !selectedKeys.has(k.id))
      onSaveKeys(updatedKeys)
      setSelectedKeys(new Set())
      toast.success(`已删除 ${selectedKeys.size} 个 API Key`)
    }
  }

  const handleSelectAll = () => {
    if (selectedKeys.size === filteredKeys.length) {
      setSelectedKeys(new Set())
    } else {
      setSelectedKeys(new Set(filteredKeys.map(k => k.id)))
    }
  }

  const toggleSelectKey = (id: string) => {
    const newSelected = new Set(selectedKeys)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedKeys(newSelected)
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleToggleFavorite = (id: string) => {
    const updatedKeys = keys.map(k =>
      k.id === id ? { ...k, isFavorite: !k.isFavorite } : k
    )
    onSaveKeys(updatedKeys)
  }

  const filteredKeys = keys.filter(k => {
    const matchesSearch = k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = filterCategory === 'all' ||
      (filterCategory === 'uncategorized' && !k.category) ||
      k.category === filterCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">我的 API Keys</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">共 {keys.length} 个密钥</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {selectedKeys.size > 0 && (
              <button
                onClick={handleBatchDelete}
                className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                删除 ({selectedKeys.size})
              </button>
            )}
            <button
              onClick={() => {
                setEditingKey(null)
                setShowAddModal(true)
              }}
              className="flex-1 sm:flex-none bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加 Key
            </button>
          </div>
        </div>

        {/* 分类过滤 */}
        <div className="mb-4 overflow-x-auto">
          <div className="flex flex-nowrap gap-2 pb-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`flex-shrink-0 px-3 py-1 rounded-lg text-sm transition-colors ${
                filterCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              全部 ({keys.length})
            </button>
            <button
              onClick={() => setFilterCategory('uncategorized')}
              className={`flex-shrink-0 px-3 py-1 rounded-lg text-sm transition-colors ${
                filterCategory === 'uncategorized'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              未分类 ({keys.filter(k => !k.category).length})
            </button>
            {settings.categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`flex-shrink-0 px-3 py-1 rounded-lg text-sm transition-colors ${
                  filterCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat} ({keys.filter(k => k.category === cat).length})
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索平台名称、标签... (Ctrl+F)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {filteredKeys.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedKeys.size === filteredKeys.length && filteredKeys.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedKeys.size > 0 ? `已选择 ${selectedKeys.size} 个` : '全选'}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {filteredKeys.map(key => (
          <div key={key.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedKeys.has(key.id)}
                onChange={() => toggleSelectKey(key.id)}
                className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{key.name}</h3>
                  <button
                    onClick={() => handleToggleFavorite(key.id)}
                    className={`transition-colors ${
                      key.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
                    }`}
                    title={key.isFavorite ? '取消收藏' : '收藏'}
                  >
                    <Star className={`w-4 h-4 md:w-5 md:h-5 ${key.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{key.platform}</p>

                <div className="flex items-center gap-2 mb-2">
                  <code className="flex-1 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg text-xs md:text-sm font-mono text-gray-700 dark:text-gray-300 overflow-hidden break-all">
                    {showPassword[key.id] ? key.key : '•'.repeat(Math.min(key.key.length, 32))}
                  </code>
                  <button
                    onClick={() => togglePasswordVisibility(key.id)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                    title={showPassword[key.id] ? '隐藏' : '显示'}
                  >
                    {showPassword[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(key.key)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                    title="复制"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {key.note && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{key.note}</p>
                )}

                <div className="flex gap-2 flex-wrap">
                  {key.category && (
                    <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                      {key.category}
                    </span>
                  )}
                  {key.tags && key.tags.length > 0 && key.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setEditingKey(key)
                    setShowAddModal(true)
                  }}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteKey(key.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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

      {showAddModal && (
        <AddKeyModal
          key={editingKey?.id || 'new'}
          initialData={editingKey}
          onSave={handleSaveKey}
          onClose={() => {
            setShowAddModal(false)
            setEditingKey(null)
          }}
          categories={settings.categories}
        />
      )}
    </div>
  )
}

interface AddKeyModalProps {
  initialData: ApiKey | null
  onSave: (data: Partial<ApiKey>) => void
  onClose: () => void
  categories: string[]
}

function AddKeyModal({ initialData, onSave, onClose, categories }: AddKeyModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    platform: initialData?.platform || '',
    key: initialData?.key || '',
    note: initialData?.note || '',
    tags: initialData?.tags?.join(', ') || '',
    category: initialData?.category || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      category: formData.category || undefined
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
            <label className="block text-sm font-medium text-gray-700 mb-1">分类（可选）</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">未分类</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
