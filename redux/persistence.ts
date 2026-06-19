import type { RootState } from './store'

const STORAGE_KEY = 'reduxPersist'
const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const PERSISTED_FORM_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'location', 'paymentMethod'] as const

type PersistedPayload = {
  form: Record<string, unknown>
  savedAt: number
}

export function loadPersistedState(): Record<string, unknown> | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as PersistedPayload
    if (Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return undefined
    }
    return { form: parsed.form }
  } catch {
    return undefined
  }
}

export function saveFormData(form: RootState['form']): void {
  try {
    const toSave: Record<string, unknown> = {}
    for (const key of PERSISTED_FORM_FIELDS) {
      toSave[key] = form[key]
    }
    const payload: PersistedPayload = { form: toSave, savedAt: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage unavailable
  }
}
