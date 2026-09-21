import React, { useState } from 'react'
import { ApiKey, Settings, ExportData } from '@/types'
import { CryptoService } from '@/shared/storage'
import { Download, Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react'

interface ImportExportViewProps {
  keys: ApiKey[]
  settings: Settings
  currentPassword: string
  onSaveKeys: (keys: ApiKey[]) => void
}

export default function ImportExportView({ keys, settings, currentPassword, onSaveKeys }: ImportExportViewProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [importPassword, setImportPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)

  const handleExport = async () => {
    try {
      const exportData: ExportData = {
        version: '1.0',
        exportDate: Date.now(),
        keys: keys,
        categories: settings.categories
      }

      // 加密导出数据
      const encrypted = await CryptoService.encrypt(JSON.stringify(exportData), currentPassword)

      const blob = new Blob([JSON.stringify(encrypted, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `apikeyper-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: '导出成功！数据已加密保存' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: '导出失败：' + (error as Error).message })
    }
  }

  const handleExportPlain = () => {
    const exportData: ExportData = {
      version: '1.0',
      exportDate: Date.now(),
      keys: keys,
      categories: settings.categories
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apikeyper-plain-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setMessage({ type: 'success', text: '导出成功！注意：数据未加密，请妥善保管' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      // 检查是否是加密数据
      if (data.iv && data.encryptedData && data.salt) {
        setShowPasswordInput(true)
        // 临时存储，等待密码输入
        ;(window as any)._pendingImportData = data
      } else {
        // 未加密的数据
        await processImportData(data)
      }
    } catch (error) {
      setMessage({ type: 'error', text: '导入失败：文件格式错误' })
    }

    // 重置文件输入
    event.target.value = ''
  }

  const handleImportWithPassword = async () => {
    if (!importPassword) {
      setMessage({ type: 'error', text: '请输入解密密码' })
      return
    }

    try {
      const encryptedData = (window as any)._pendingImportData
      const decrypted = await CryptoService.decrypt(encryptedData, importPassword)
      const data = JSON.parse(decrypted)
      await processImportData(data)

      setShowPasswordInput(false)
      setImportPassword('')
      delete (window as any)._pendingImportData
    } catch (error) {
      setMessage({ type: 'error', text: '解密失败：密码可能不正确' })
    }
  }

  const processImportData = async (data: ExportData) => {
    if (!data.version || !data.keys) {
      throw new Error('文件格式不正确')
    }

    if (confirm(`将导入 ${data.keys.length} 个 API Key，是否继续？现有数据将被合并。`)) {
      // 合并数据，避免重复
      const existingIds = new Set(keys.map(k => k.id))
      const newKeys = data.keys.filter(k => !existingIds.has(k.id))
      const mergedKeys = [...keys, ...newKeys]

      onSaveKeys(mergedKeys)
      setMessage({ type: 'success', text: `成功导入 ${newKeys.length} 个新的 API Key` })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">数据导入/导出</h2>
          <p className="text-sm text-gray-600 mt-1">备份和迁移你的 API Keys</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p>{message.text}</p>
          </div>
        )}

        {/* 导出区域 */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">导出数据</h3>
              <p className="text-sm text-gray-600">将所有数据导出为 JSON 文件</p>
            </div>
          </div>

          <div className="space-y-3 ml-12">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">加密导出</h4>
                  <p className="text-sm text-gray-600">
                    使用当前主密码加密数据。导入时需要相同的密码才能解密。
                  </p>
                </div>
                <button
                  onClick={handleExport}
                  className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  导出
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>推荐：数据安全加密</span>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">明文导出</h4>
                  <p className="text-sm text-gray-600">
                    导出未加密的 JSON 文件。方便查看和编辑，但不够安全。
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('明文导出将不加密数据，请确保文件安全。是否继续？')) {
                      handleExportPlain()
                    }
                  }}
                  className="ml-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <FileJson className="w-4 h-4" />
                  导出
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>警告：数据未加密</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              当前共有 {keys.length} 个 API Key
            </p>
          </div>
        </section>

        <hr className="my-8 border-gray-200" />

        {/* 导入区域 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">导入数据</h3>
              <p className="text-sm text-gray-600">从备份文件恢复数据</p>
            </div>
          </div>

          <div className="ml-12">
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-2">选择备份文件导入</p>
              <p className="text-sm text-gray-500 mb-4">支持加密和未加密的 JSON 文件</p>
              <label className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                选择文件
              </label>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">导入说明</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 导入的数据会与现有数据合并，不会覆盖</li>
                <li>• 如果是加密文件，需要输入导出时的密码</li>
                <li>• 相同 ID 的密钥会被跳过，避免重复</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 密码输入弹窗 */}
        {showPasswordInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">输入解密密码</h3>
              <p className="text-sm text-gray-600 mb-4">
                该文件已加密，请输入导出时使用的主密码
              </p>

              <input
                type="password"
                value={importPassword}
                onChange={(e) => setImportPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleImportWithPassword()
                }}
                placeholder="输入密码"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPasswordInput(false)
                    setImportPassword('')
                    delete (window as any)._pendingImportData
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleImportWithPassword}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  解密并导入
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
