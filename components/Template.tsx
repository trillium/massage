import clsx from 'clsx'

interface TemplateProps {
  title: string
  text?: string | string[]
  classes?: string
  center?: boolean
}

export default function Template({ title, text, classes, center = false }: TemplateProps) {
  const renderText = () => {
    if (!text) return null
    if (typeof text === 'string') {
      return (
        <p className="mt-2 mb-2 font-medium text-gray-800 sm:mt-6 sm:text-xl dark:text-gray-100">
          {text}
        </p>
      )
    }
    if (Array.isArray(text)) {
      return text.map((paragraph, index) => (
        <p
          key={index}
          className="mt-2 font-medium text-gray-800 last:mb-2 sm:mt-6 sm:text-xl dark:text-gray-100"
        >
          {paragraph}
        </p>
      ))
    }
    return null
  }

  return (
    <div
      className={clsx('py-4', {
        'text-center': center,
      })}
    >
      <h1 className="text-primary-500 dark:text-primary-400 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h1>
      {renderText()}
    </div>
  )
}
