'use client'

import { Fragment, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  confirmClassName?: string
  typeToConfirm?: string
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmClassName = 'bg-primary-500 hover:bg-primary-600 text-white',
  typeToConfirm,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('')
  const confirmed = !typeToConfirm || typed.toLowerCase() === typeToConfirm.toLowerCase()

  function handleClose() {
    setTyped('')
    onClose()
  }

  return (
    <Transition show={open} as={Fragment} afterLeave={() => setTyped('')}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <DialogPanel className="w-full max-w-sm rounded-lg border border-accent-200 bg-surface-50 p-6 shadow-xl dark:border-accent-700 dark:bg-surface-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (confirmed) {
                      onConfirm()
                      handleClose()
                    }
                  }}
                >
                  <DialogTitle className="text-lg font-semibold text-accent-900 dark:text-accent-100">
                    {title}
                  </DialogTitle>
                  <p className="mt-2 text-sm text-accent-600 dark:text-accent-400">{message}</p>
                  {typeToConfirm && (
                    <div className="mt-4">
                      <label className="text-sm text-accent-600 dark:text-accent-400">
                        Type <span className="font-semibold">{typeToConfirm}</span> to confirm
                      </label>
                      <input
                        type="text"
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        className="mt-1.5 w-full rounded border border-accent-300 bg-white px-3 py-2 text-sm text-accent-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-accent-600 dark:bg-surface-700 dark:text-accent-100"
                        autoFocus
                      />
                    </div>
                  )}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded border border-accent-300 px-4 py-2 text-sm font-semibold text-accent-700 hover:bg-surface-100 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!confirmed}
                      className={`rounded px-4 py-2 text-sm font-semibold disabled:opacity-50 ${confirmClassName}`}
                    >
                      {confirmLabel}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
