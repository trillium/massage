import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockContactInsert = vi.fn()
const mockContactUpdate = vi.fn()
const mockEmailInsert = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: () => ({
    from: (table: string) => {
      if (table === 'contact_submissions') {
        return {
          insert: mockContactInsert,
          update: mockContactUpdate,
        }
      }
      if (table === 'email_sends') {
        return { insert: mockEmailInsert }
      }
      return {}
    },
  }),
}))

import { logContactSubmission, updateContactSubmission, logEmailSend } from '../db/auditLog'

beforeEach(() => {
  vi.clearAllMocks()

  mockContactInsert.mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { id: 'sub-123' }, error: null }),
    }),
  })

  mockContactUpdate.mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  })

  mockEmailInsert.mockResolvedValue({ error: null })
})

describe('logContactSubmission', () => {
  it('inserts with send_state=received and returns id', async () => {
    const id = await logContactSubmission({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '555-1234',
      subject: 'Inquiry',
      message: 'Hello',
    })

    expect(mockContactInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        send_state: 'received',
        email: 'jane@example.com',
        name: 'Jane Doe',
      })
    )
    expect(id).toBe('sub-123')
  })

  it('returns null on DB error', async () => {
    mockContactInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } }),
      }),
    })
    const id = await logContactSubmission({ name: 'x', email: 'x@x.com', message: 'x' })
    expect(id).toBeNull()
  })
})

describe('updateContactSubmission', () => {
  it('updates to success with updated_at', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    mockContactUpdate.mockReturnValue({ eq: mockEq })

    await updateContactSubmission('sub-123', { send_state: 'success' })

    expect(mockContactUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ send_state: 'success', updated_at: expect.any(String) })
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'sub-123')
  })

  it('updates to failed with error_detail', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    mockContactUpdate.mockReturnValue({ eq: mockEq })

    await updateContactSubmission('sub-123', { send_state: 'failed', error_detail: 'SMTP error' })

    expect(mockContactUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ send_state: 'failed', error_detail: 'SMTP error' })
    )
  })
})

describe('logEmailSend', () => {
  it('inserts success row with sent_at set', async () => {
    await logEmailSend({
      template: 'contactFormEmail',
      to_address: 'admin@test.com',
      subject: 'New Contact Form: Inquiry',
      variables: { name: 'Jane Doe', email: 'jane@example.com' },
      send_state: 'success',
    })

    expect(mockEmailInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'contactFormEmail',
        to_address: 'admin@test.com',
        send_state: 'success',
        sent_at: expect.any(String),
      })
    )
  })

  it('inserts failed row with null sent_at and error_detail', async () => {
    await logEmailSend({
      template: 'ApprovalEmail',
      to_address: 'admin@test.com',
      send_state: 'failed',
      error_detail: 'No refresh token',
    })

    expect(mockEmailInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'ApprovalEmail',
        send_state: 'failed',
        sent_at: null,
        error_detail: 'No refresh token',
      })
    )
  })

  it('does not throw when DB insert fails', async () => {
    mockEmailInsert.mockResolvedValue({ error: { message: 'DB down' } })
    await expect(
      logEmailSend({ template: 'x', to_address: 'x@x.com', send_state: 'success' })
    ).resolves.toBeUndefined()
  })
})
