import { ApiKey, EncryptedData, Settings } from '@/types'

const STORAGE_KEY = 'apikeyper_data'
const MASTER_PASSWORD_KEY = 'apikeyper_master_hash'
const SETTINGS_KEY = 'apikeyper_settings'

const DEFAULT_SETTINGS: Settings = {
  storagePath: 'localStorage',
  passwordExpiry: 15,
  autoLock: true,
  theme: 'light',
  language: 'zh-CN',
  categories: ['工作', '个人', '测试']
}

export class CryptoService {
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }

  static async encrypt(data: string, password: string): Promise<EncryptedData> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const key = await this.deriveKey(password, salt)

    const encoder = new TextEncoder()
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    )

    return {
      iv: this.arrayBufferToBase64(iv),
      encryptedData: this.arrayBufferToBase64(encrypted),
      salt: this.arrayBufferToBase64(salt)
    }
  }

  static async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    const salt = this.base64ToArrayBuffer(encryptedData.salt)
    const iv = this.base64ToArrayBuffer(encryptedData.iv)
    const data = this.base64ToArrayBuffer(encryptedData.encryptedData)

    const key = await this.deriveKey(password, new Uint8Array(salt))

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      data
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }

  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return this.arrayBufferToBase64(hash)
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}

export class StorageService {
  static async saveKeys(keys: ApiKey[], password: string): Promise<void> {
    const data = JSON.stringify(keys)
    const encrypted = await CryptoService.encrypt(data, password)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted))
  }

  static async loadKeys(password: string): Promise<ApiKey[]> {
    const storedData = localStorage.getItem(STORAGE_KEY)
    if (!storedData) return []

    try {
      const encrypted: EncryptedData = JSON.parse(storedData)
      const decrypted = await CryptoService.decrypt(encrypted, password)
      return JSON.parse(decrypted)
    } catch (error) {
      throw new Error('解密失败，密码可能不正确')
    }
  }

  static async setMasterPassword(password: string): Promise<void> {
    const hash = await CryptoService.hashPassword(password)
    localStorage.setItem(MASTER_PASSWORD_KEY, hash)
  }

  static async verifyMasterPassword(password: string): Promise<boolean> {
    const storedHash = localStorage.getItem(MASTER_PASSWORD_KEY)
    if (!storedHash) return false

    const hash = await CryptoService.hashPassword(password)
    return hash === storedHash
  }

  static hasMasterPassword(): boolean {
    return localStorage.getItem(MASTER_PASSWORD_KEY) !== null
  }

  static getSettings(): Settings {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) return DEFAULT_SETTINGS

    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    } catch {
      return DEFAULT_SETTINGS
    }
  }

  static saveSettings(settings: Settings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }
}
