export interface AdminSession {
  email: string
  token: string
  timestamp: number
  expiresAt: number
}

export interface AuthNavLink {
  href: string
  title: string
  description?: string
  category?: 'primary' | 'tools' | 'testing' | 'management'
}
