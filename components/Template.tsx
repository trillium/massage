import clsx from 'clsx'

interface TemplateProps {
  title: string
  text?: string
  classes?: string
  center?: boolean
}

export default function Template({ title, text, classes, center = false }: TemplateProps) {
  return (
    <div
      className={clsx('py-4', {
        'text-center': center,
      })}
    >
      <h1 className="text-primary-500 dark:text-primary-400 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h1>
      {text && (
        <p className="mt-2 font-medium text-gray-800 sm:mt-6 sm:text-xl dark:text-gray-100">
          {text}
        </p>
      )}
    </div>
  )
}
