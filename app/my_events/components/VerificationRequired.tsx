export function VerificationRequired({ verificationError }: { verificationError: string | null }) {
  return (
    <div className="rounded-lg bg-yellow-50 p-6 shadow-sm dark:bg-yellow-900/20">
      {verificationError ? (
        <div className="text-center">
          <div className="mb-4 text-red-600 dark:text-red-400">
            <svg
              className="mx-auto mb-4 h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Email Verification Required
          </h2>
          <p className="mb-4 text-red-600 dark:text-red-400">{verificationError}</p>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>
              To access your events securely, you need to use the verification link sent to your
              email.
            </p>
            <p>If you don't have this link, please contact support for assistance.</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
        </div>
      )}
    </div>
  )
}
