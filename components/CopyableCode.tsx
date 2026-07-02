'use client'

import { useState } from 'react'

interface CopyableCodeProps {
  code: string
  label?: string
}

export default function CopyableCode({ code, label }: CopyableCodeProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    // ds-ignore — raw button so the copy-affordance styling isn't fought by design-system Button defaults
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label ? `Copy ${label}` : `Copy ${code}`}
      className="group my-2 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 font-mono text-base font-semibold text-gray-900 transition hover:border-primary-500 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-primary-400 dark:hover:bg-primary-950"
    >
      <span>{code}</span>
      <span
        className={`text-xs font-medium transition ${
          copied
            ? 'text-green-600 dark:text-green-400'
            : 'text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-400'
        }`}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </span>
    </button>
  )
}
