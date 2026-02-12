import { ReactNode } from 'react'

interface StyledButtonWrapperProps {
  variant?: 'airbnb' | 'primary'
  children: ReactNode
}

export default function StyledButtonWrapper({
  variant = 'primary',
  children,
}: StyledButtonWrapperProps) {
  const colors = {
    airbnb: {
      border: 'border-[#FF5A5F] dark:border-[#FF5A5F]',
      bg: 'bg-[#FF5A5F]',
      gradientFrom: 'group-hover:from-[#FF385C]',
      gradientVia: 'group-hover:via-[#FF5A5F]',
      gradientTo: 'group-hover:to-[#FF5A5F]',
      text: 'text-[#FF5A5F] dark:text-white',
      decoration: 'decoration-[#FF5A5F] hover:decoration-[#FF385C]',
    },
    primary: {
      border: 'border-primary-500 dark:border-primary-400',
      bg: 'bg-primary-500',
      gradientFrom: 'group-hover:from-primary-400',
      gradientVia: 'group-hover:via-primary-500',
      gradientTo: 'group-hover:to-primary-500',
      text: 'text-black-500 dark:text-white',
      decoration: 'decoration-primary-500 hover:decoration-primary-600',
    },
  }

  const style = colors[variant]

  return (
    <div className="my-8 flex justify-center">
      <div
        className={`group relative inline-flex h-[calc(48px+8px)] items-center justify-center rounded-full border-4 pr-14 pl-6 font-medium ${style.border}`}
      >
        <div
          className={`absolute right-0 -z-0 inline-flex h-12 w-12 items-center justify-end rounded-full transition-[width] group-hover:w-[calc(100%)] group-hover:bg-gradient-to-r ${style.bg} ${style.gradientFrom} ${style.gradientVia} ${style.gradientTo}`}
        >
          <div className="mr-3.5 flex items-center justify-center">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke h-5 w-5 stroke-white"
            >
              <path
                d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <span className={`z-0 pr-2 text-xl font-bold ${style.text}`}>{children}</span>
      </div>
    </div>
  )
}
