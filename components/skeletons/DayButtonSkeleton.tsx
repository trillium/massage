import clsx from "clsx"
import { twMerge } from "tailwind-merge"

export const DayButtonSkeleton = (props: { classes?: string }) => {
  return (
    <div
      className={twMerge(
        clsx(
          "p-4 transition-all flex flex-col items-center outline-primary-600 relative",
          props.classes,
          "font-semibold bg-slate-300 dark:bg-gray-800 text-slate-800 dark:text-slate-200 border border-transparent"
        )
      )}
      aria-label={`Available date ${new Date().toString()} in calendar`}
      {...props}>
      <div className="flex flex-col items-center justify-between leading-none">
        <p className="font-semibold text-[0.55rem] leading-0 h-3 items-center flex text-primary-700 dark:text-primary-600">
          {" "}
        </p>
        <time className="text-base text-slate-600 flex leading-0 items-center">#</time>
        <figure
          className="flex items-center space-x-0.5 h-3 justify-center"
          aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`availability-bar-${index}`}
              className="rounded-full w-1 h-1 bg-gray-600"
            />
          ))}
        </figure>
      </div>
    </div>
  )
}
