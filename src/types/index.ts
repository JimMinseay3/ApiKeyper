export interface ApiKey {
  id: string
  name: string
  platform: string
  key: string
  createdAt: number
  updatedAt: number
  note?: string
  tags?: string[]
}

export interface EncryptedData {
  iv: string
  encryptedData: string
  salt: string
}

export interface Settings {
  storagePath: string
  passwordExpiry: number // 密码过期时长（分钟），0 表示不过期
  autoLock: boolean // 自动锁定
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
}

export type MenuItem = 'keys' | 'favorites' | 'categories' | 'import-export' | 'settings' | 'about'
