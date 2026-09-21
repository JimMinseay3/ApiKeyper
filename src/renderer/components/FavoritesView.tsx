import React, { useState } from 'react'
import { ApiKey } from '@/types'
import { Star, Search, Copy, Trash2, Edit, Eye, EyeOff } from 'lucide-react'

interface FavoritesViewProps {
  keys: ApiKey[]
  onSaveKeys: (keys: ApiKey[]) => void
  onEditKey: (key: ApiKey) => void
}

export default function FavoritesView({ keys, onSaveKeys, onEditKey }: FavoritesViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({})

  const favoriteKeys = keys.filter(k => k.isFavorite)

  const handleToggleFavorite = (id: string) => {
    const updatedKeys = keys.map(k =>
      k.id === id ? { ...k, isFavorite: !k.isFavorite } : k
    )
    onSaveKeys(updatedKeys)
  }

  const handleDeleteKey = (id: string) => {
    if (confirm('确定要删除这个 API Key 吗？')) {
      const updatedKeys = keys.filter(k => k.id !== id)
      onSaveKeys(updatedKeys)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredKeys = favoriteKeys.filter(k =>
    k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.platform.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">收藏夹</h2>
            <p className="text-sm text-gray-600 mt-1">共 {favoriteKeys.length} 个收藏</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索收藏的密钥..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredKeys.map(key => (
          <div key={key.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                  <button
                    onClick={() => handleToggleFavorite(key.id)}
                    className="text-yellow-500 hover:text-yellow-600 transition-colors"
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">{key.platform}</p>

                <div className="flex items-center gap-2 mb-2">
                  <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm font-mono text-gray-700 overflow-hidden">
                    {showPassword[key.id] ? key.key : '•'.repeat(32)}
                  </code>
                  <button
                    onClick={() => togglePasswordVisibility(key.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showPassword[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(key.key)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {key.category && (
                  <span className="inline-block text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                    {key.category}
                  </span>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onEditKey(key)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteKey(key.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredKeys.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>{searchTerm ? '没有找到匹配的收藏' : '还没有收藏任何 API Key'}</p>
            <p className="text-sm mt-2">在 API Keys 页面点击星标收藏</p>
          </div>
        )}
      </div>
    </div>
  )
}
