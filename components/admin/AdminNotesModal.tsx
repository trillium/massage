'use client'

import { Fragment, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { adminFetch } from '@/lib/adminFetch'
import { formatLocalTime } from 'lib/availability/helpers'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import clsx from 'clsx'

interface Appointment {
  id: string
  client_first_name: string
  client_last_name: string
  client_email: string
  client_phone: string | null
  start_time: string
  end_time: string
  duration_minutes: number
  status: string
  promo: string | null
  location: string | null
  admin_notes: string | null
  created_at: string
}

type AdminNotesModalProps = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  onDeleted: () => void
  appointment: Appointment | null
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

export default function AdminNotesModal({
  open,
  onClose,
  onSaved,
  onDeleted,
  appointment,
}: AdminNotesModalProps) {
  const [notes, setNotes] = useState(appointment?.admin_notes ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpen() {
    setNotes(appointment?.admin_notes ?? '')
    setError(null)
  }

  async function handleSave() {
    if (!appointment) return
    setSaving(true)
    setError(null)

    try {
      const response = await adminFetch(`/api/admin/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes.trim() || null }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Failed to save')
        return
      }

      onSaved()
      onClose()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!appointment) return
    setDeleting(true)
    setError(null)

    try {
      const response = await adminFetch(`/api/admin/appointments/${appointment.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error ?? 'Failed to delete')
        return
      }

      onDeleted()
      onClose()
    } catch {
      setError('Network error')
    } finally {
      setDeleting(false)
    }
  }

  if (!appointment) return null

  return (
    <Transition show={open} as={Fragment} afterEnter={handleOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-surface-900/75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg rounded-lg border border-accent-200 bg-surface-50 p-6 shadow-xl dark:border-accent-700 dark:bg-surface-800">
                <div className="flex items-start justify-between">
                  <DialogTitle className="text-xl font-semibold text-accent-900 dark:text-accent-100">
                    {appointment.client_first_name} {appointment.client_last_name}
                  </DialogTitle>
                  <span
                    className={clsx(
                      'rounded px-2 py-0.5 text-xs font-medium',
                      STATUS_STYLES[appointment.status] ?? 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-accent-600 dark:text-accent-400">
                  <div className="flex justify-between">
                    <span className="font-medium text-accent-700 dark:text-accent-300">Time</span>
                    <span>
                      {formatLocalTime(appointment.start_time)} –{' '}
                      {formatLocalTime(appointment.end_time)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-accent-700 dark:text-accent-300">
                      Duration
                    </span>
                    <span>{appointment.duration_minutes}min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-accent-700 dark:text-accent-300">Email</span>
                    <span>{appointment.client_email}</span>
                  </div>
                  {appointment.client_phone && (
                    <div className="flex justify-between">
                      <span className="font-medium text-accent-700 dark:text-accent-300">
                        Phone
                      </span>
                      <span>{appointment.client_phone}</span>
                    </div>
                  )}
                  {appointment.location && (
                    <div className="flex justify-between">
                      <span className="font-medium text-accent-700 dark:text-accent-300">
                        Location
                      </span>
                      <span className="text-right">{appointment.location}</span>
                    </div>
                  )}
                  {appointment.promo && (
                    <div className="flex justify-between">
                      <span className="font-medium text-accent-700 dark:text-accent-300">
                        Promo
                      </span>
                      <span className="rounded bg-purple-100 px-1.5 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        {appointment.promo}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-accent-200 pt-4 dark:border-accent-700">
                  <label className="text-sm font-medium text-accent-700 dark:text-accent-300">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="mt-1.5 w-full rounded border border-accent-300 bg-white px-3 py-2 text-sm text-accent-900 placeholder:text-accent-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-accent-600 dark:bg-surface-700 dark:text-accent-100 dark:placeholder:text-accent-500"
                    placeholder="Add notes about this appointment..."
                  />
                </div>

                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}

                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={deleting}
                    className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded border border-accent-300 px-4 py-2 text-sm font-semibold text-accent-700 hover:bg-surface-100 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                <ConfirmDialog
                  open={confirmDelete}
                  onClose={() => setConfirmDelete(false)}
                  onConfirm={handleDelete}
                  title="Delete Appointment"
                  message={`Delete ${appointment.client_first_name} ${appointment.client_last_name}'s appointment? This cannot be undone.`}
                  confirmLabel="Delete"
                  confirmClassName="bg-red-600 hover:bg-red-700 text-white"
                  typeToConfirm="delete"
                />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
