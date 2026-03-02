import React, { Fragment } from 'react'
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { MdClose } from 'react-icons/md'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  maxWidth?: string
  transparent?: boolean
}

export const Dialog = ({
  open,
  onOpenChange,
  children,
  maxWidth = 'max-w-4xl',
  transparent = false,
}: DialogProps) => {
  return (
    <Transition show={open} as={Fragment}>
      <HeadlessDialog as="div" className="relative z-50" onClose={onOpenChange}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={
              transparent
                ? 'fixed inset-0 bg-black/50'
                : 'fixed inset-0 bg-black/80 transition-opacity'
            }
          />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel
              className={`w-full ${maxWidth} ${transparent ? 'bg-transparent' : 'bg-white rounded-lg shadow-lg dark:bg-gray-900'}`}
            >
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </HeadlessDialog>
    </Transition>
  )
}

interface DialogCloseButtonProps {
  onClick: () => void
  transparent?: boolean
}

export const DialogCloseButton = ({ onClick, transparent = false }: DialogCloseButtonProps) => (
  <button
    onClick={onClick}
    className={`absolute -top-10 right-0 p-1 rounded-full transition-colors ${
      transparent
        ? 'bg-white/10 hover:bg-white/20 text-white'
        : 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600'
    }`}
  >
    <MdClose className="w-5 h-5" />
  </button>
)
