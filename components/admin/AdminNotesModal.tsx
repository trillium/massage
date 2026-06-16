/* ds-ignore-file */
'use client'

import { Fragment, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import admin from '@/data/admin.json'
import { adminFetch } from '@/lib/adminFetch'
import { formatLocalTime } from 'lib/availability/helpers'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import clsx from 'clsx'
import { Appointment, STATUS_STYLES } from '@/components/admin/appointmentTypes'
import { TextSm, TextXs } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

type AdminNotesModalProps = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  onDeleted: () => void
  appointment: Appointment | null
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" justify="between">
      <span className="font-medium text-accent-700 dark:text-accent-300">{label}</span>
      {children}
    </Stack>
  )
}

function AppointmentDetails({ appointment }: { appointment: Appointment }) {
  return (
    <Box className="mt-4 space-y-2 text-sm text-accent-600 dark:text-accent-400">
      <DetailRow label={admin.notesModal.labels.time}>
        <span>
          {/* biome-ignore lint/style/noJsxLiterals: time range separator */}
          {formatLocalTime(appointment.start_time)} – {formatLocalTime(appointment.end_time)}
        </span>
      </DetailRow>
      <DetailRow label={admin.notesModal.labels.duration}>
        <span>
          {/* biome-ignore lint/style/noJsxLiterals: duration suffix */}
          {appointment.duration_minutes}min
        </span>
      </DetailRow>
      <DetailRow label={admin.notesModal.labels.email}>
        <span>{appointment.client_email}</span>
      </DetailRow>
      {appointment.client_phone && (
        <DetailRow label={admin.notesModal.labels.phone}>
          <span>{appointment.client_phone}</span>
        </DetailRow>
      )}
      {appointment.location && (
        <DetailRow label={admin.notesModal.labels.location}>
          <span className="text-right">{appointment.location}</span>
        </DetailRow>
      )}
      {appointment.promo && (
        <DetailRow label={admin.notesModal.labels.promo}>
          <TextXs className="rounded bg-purple-100 px-1.5 dark:bg-purple-900">
            {appointment.promo}
          </TextXs>
        </DetailRow>
      )}
    </Box>
  )
}

function ModalActions({
  saving,
  deleting,
  onDelete,
  onCancel,
  onSave,
}: {
  saving: boolean
  deleting: boolean
  onDelete: () => void
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <Stack className="mt-4" direction="row" justify="between">
      <Button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
      >
        {deleting ? admin.notesModal.buttons.deleting : admin.notesModal.buttons.delete}
      </Button>
      <Stack direction="row" gap={3}>
        <Button
          type="button"
          onClick={onCancel}
          className="rounded border border-accent-300 px-4 py-2 text-sm font-semibold text-accent-700 hover:bg-surface-100 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-700"
        >
          {admin.notesModal.buttons.cancel}
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
        >
          {saving ? admin.notesModal.buttons.saving : admin.notesModal.buttons.save}
        </Button>
      </Stack>
    </Stack>
  )
}

async function patchAppointment(id: string, notes: string) {
  return adminFetch(`/api/admin/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_notes: notes.trim() || null }),
  })
}

async function deleteAppointment(id: string) {
  return adminFetch(`/api/admin/appointments/${id}`, { method: 'DELETE' })
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
      const response = await patchAppointment(appointment.id, notes)
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
      const response = await deleteAppointment(appointment.id)
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
          <Box className="fixed inset-0 bg-surface-900/75 transition-opacity" />
        </TransitionChild>

        <Box className="fixed inset-0 z-10 overflow-y-auto">
          <Stack className="min-h-full p-4" direction="row" align="center" justify="center">
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
                <Stack direction="row" align="start" justify="between">
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
                </Stack>

                <AppointmentDetails appointment={appointment} />

                <Box className="mt-5 border-t border-accent-200 pt-4 dark:border-accent-700">
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: implicit association via wrapped Textarea */}
                  <label className="block text-sm font-medium text-accent-700 dark:text-accent-300">
                    {admin.notesModal.labels.notes}
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="mt-1.5 w-full rounded border border-accent-300 bg-white px-3 py-2 text-sm text-accent-900 placeholder:text-accent-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-accent-600 dark:bg-surface-700 dark:text-accent-100 dark:placeholder:text-accent-500"
                      placeholder={admin.notesModal.placeholders.notes}
                    />
                  </label>
                </Box>

                {error && (
                  <TextSm className="mt-2" status="error">
                    {error}
                  </TextSm>
                )}

                <ModalActions
                  saving={saving}
                  deleting={deleting}
                  onDelete={() => setConfirmDelete(true)}
                  onCancel={onClose}
                  onSave={handleSave}
                />

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
          </Stack>
        </Box>
      </Dialog>
    </Transition>
  )
}
