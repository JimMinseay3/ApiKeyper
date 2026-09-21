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
