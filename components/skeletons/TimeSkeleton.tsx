import clsx from "clsx"

export const TimeSkeleton = () => {
    return (
      <button
        className={clsx(
          "rounded-md border-slate-700 border bg-gray-800 py-2 px-3 shadow-sm transition-all",
          "text-sm text-gray-600 font-semibold",
          "active:mt-0.5 active:-mb-0.5"
        )}
        >
        #:## ## - #:## ##
      </button>
    )
  }
  