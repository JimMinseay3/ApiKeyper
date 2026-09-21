import React, { useState } from 'react'
import { ApiKey, Settings } from '@/types'
import { FolderTree, Plus, Trash2, Edit2, Check, X } from 'lucide-react'

interface CategoriesViewProps {
  keys: ApiKey[]
  settings: Settings
  onSaveKeys: (keys: ApiKey[]) => void
  onSettingsChange: (settings: Settings) => void
}

export default function CategoriesView({ keys, settings, onSaveKeys, onSettingsChange }: CategoriesViewProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  const getCategoryCount = (category: string) => {
    return keys.filter(k => k.category === category).length
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !settings.categories.includes(newCategoryName.trim())) {
      const updatedSettings = {
        ...settings,
        categories: [...settings.categories, newCategoryName.trim()]
      }
      onSettingsChange(updatedSettings)
      setNewCategoryName('')
      setIsAddingCategory(false)
    }
  }

  const handleRenameCategory = (oldName: string, newName: string) => {
    if (newName.trim() && newName !== oldName) {
      // 更新设置中的分类名
      const updatedSettings = {
        ...settings,
        categories: settings.categories.map(c => c === oldName ? newName.trim() : c)
      }
      onSettingsChange(updatedSettings)

      // 更新所有使用该分类的 key
      const updatedKeys = keys.map(k =>
        k.category === oldName ? { ...k, category: newName.trim() } : k
      )
      onSaveKeys(updatedKeys)
    }
    setEditingCategory(null)
  }

  const handleDeleteCategory = (category: string) => {
    const count = getCategoryCount(category)
    const message = count > 0
      ? `分类 "${category}" 下还有 ${count} 个密钥，删除后这些密钥将变为未分类。确定要删除吗？`
      : `确定要删除分类 "${category}" 吗？`

    if (confirm(message)) {
      // 删除设置中的分类
      const updatedSettings = {
        ...settings,
        categories: settings.categories.filter(c => c !== category)
      }
      onSettingsChange(updatedSettings)

      // 清除使用该分类的 key
      const updatedKeys = keys.map(k =>
        k.category === category ? { ...k, category: undefined } : k
      )
      onSaveKeys(updatedKeys)
    }
  }

  const uncategorizedCount = keys.filter(k => !k.category).length

  return (
    <div className="p-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">分类管理</h2>
            <p className="text-sm text-gray-600 mt-1">管理 API Key 的分类标签</p>
          </div>
          <button
            onClick={() => setIsAddingCategory(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建分类
          </button>
        </div>

        <div className="space-y-3">
          {/* 未分类 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="bg-gray-200 p-2 rounded-lg">
                <FolderTree className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">未分类</p>
                <p className="text-sm text-gray-600">{uncategorizedCount} 个密钥</p>
              </div>
            </div>
          </div>

          {/* 现有分类 */}
          {settings.categories.map(category => (
            <div key={category} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              {editingCategory === category ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    defaultValue={category}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameCategory(category, e.currentTarget.value)
                      } else if (e.key === 'Escape') {
                        setEditingCategory(null)
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <FolderTree className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category}</p>
                      <p className="text-sm text-gray-600">{getCategoryCount(category)} 个密钥</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="重命名"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* 添加新分类 */}
          {isAddingCategory && (
            <div className="flex items-center gap-2 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory()
                  else if (e.key === 'Escape') {
                    setIsAddingCategory(false)
                    setNewCategoryName('')
                  }
                }}
                placeholder="输入分类名称"
                className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false)
                  setNewCategoryName('')
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {settings.categories.length === 0 && !isAddingCategory && (
          <div className="text-center py-12 text-gray-500">
            <FolderTree className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>还没有创建任何分类</p>
            <p className="text-sm mt-2">点击上方按钮创建第一个分类</p>
          </div>
        )}
      </div>
    </div>
  )
}
