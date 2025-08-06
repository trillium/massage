'use client'

import React from 'react'

interface EmailMockComponentProps {
  email: {
    subject: string
    body: string
  }
  approveUrl?: string
  onApprovalClick?: () => void
}

export default function EmailMockComponent({
  email,
  approveUrl,
  onApprovalClick,
}: EmailMockComponentProps) {
  const handleApprovalClick = () => {
    if (onApprovalClick) {
      onApprovalClick()
    }
  }

  // Process the HTML body to make approval links clickable in our mock
  const processedBody =
    approveUrl && onApprovalClick
      ? email.body.replace(
          /<a href=[^>]*>Accept the appointment<\/a>/g,
          `<a href="#" onclick="event.preventDefault(); return false;" class="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" data-approval-link="true">Accept the appointment</a>`
        )
      : email.body

  return (
    <div className="rounded border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 border-b border-gray-200 pb-2 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-300">Subject:</div>
        <div className="font-medium text-gray-800 dark:text-gray-100">{email.subject}</div>
      </div>

      <div className="email-body prose prose-sm dark:prose-invert max-w-none">
        <div
          dangerouslySetInnerHTML={{ __html: processedBody }}
          onClick={(e) => {
            const target = e.target as HTMLElement
            if (target.getAttribute('data-approval-link') === 'true') {
              handleApprovalClick()
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              const target = e.target as HTMLElement
              if (target.getAttribute('data-approval-link') === 'true') {
                handleApprovalClick()
              }
            }
          }}
          role="button"
          tabIndex={0}
          className={`[&_a] [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-700 dark:[&_a]:text-blue-400 dark:hover:[&_a]:text-blue-300 [&_div]:text-gray-800 dark:[&_div]:text-gray-200 [&_p]:mb-2`}
        />
      </div>

      {approveUrl && onApprovalClick && (
        <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
          <button
            onClick={handleApprovalClick}
            className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Simulate Approval Click
          </button>
        </div>
      )}
    </div>
  )
}
