import React from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import type { PropsWithChildren } from 'react'
import { Fragment } from 'react'

type ModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
}
export default function Modal({ open, setOpen, children }: PropsWithChildren<ModalProps>) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative flex-grow transform overflow-hidden rounded-lg border border-primary-600 bg-slate-100 px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:border-primary-500 dark:bg-slate-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
