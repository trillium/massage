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
      <h1 className="text-3xl font-bold tracking-tight text-primary-500 dark:text-primary-400 sm:text-4xl md:text-5xl">
        {title}
      </h1>
      {text && (
        <p className="mt-2 font-medium text-gray-800 dark:text-gray-100 sm:mt-6 sm:text-xl">
          {text}
        </p>
      )}
    </div>
  )
}
