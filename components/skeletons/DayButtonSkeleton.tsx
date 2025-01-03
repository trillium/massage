import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export const DayButtonSkeleton = (props: { classes?: string }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'relative flex flex-col items-center p-4 outline-primary-600 transition-all',
          props.classes,
          'border border-transparent bg-slate-300 font-semibold text-slate-800 dark:bg-gray-800 dark:text-slate-200'
        )
      )}
      aria-label={`Available date ${new Date().toString()} in calendar`}
      {...props}
    >
      <div className="flex flex-col items-center justify-between leading-none">
        <p className="leading-0 flex h-3 items-center text-[0.55rem] font-semibold text-primary-700 dark:text-primary-600">
          {' '}
        </p>
        <time className="leading-0 flex items-center text-base text-slate-600">#</time>
        <figure className="flex h-3 items-center justify-center space-x-0.5" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`availability-bar-${index}`} className="h-1 w-1 rounded-full bg-gray-600" />
          ))}
        </figure>
      </div>
    </div>
  )
}
