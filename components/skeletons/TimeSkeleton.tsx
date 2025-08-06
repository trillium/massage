import clsx from 'clsx'

export const TimeSkeleton = () => {
  return (
    <button
      className={clsx(
        'rounded-md border border-slate-700 bg-gray-800 px-3 py-2 shadow-sm transition-all',
        'text-sm font-semibold text-gray-600',
        'active:mt-0.5 active:-mb-0.5'
      )}
    >
      #:## ## - #:## ##
    </button>
  )
}
