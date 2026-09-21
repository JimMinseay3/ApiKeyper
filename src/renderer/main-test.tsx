import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// 简化版本，暂时移除所有 Context
function TestApp() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">ApiKeyper</h1>
        <p className="text-gray-600">测试版本 - 如果你能看到这个，说明 React 加载成功</p>
      </div>
    </div>
  )
}

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>,
  )
} else {
  console.error('Root element not found!')
}
