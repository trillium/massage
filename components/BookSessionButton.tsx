import Link from "next/link"

interface BookSessionButtonProps {
  href: string // href must be a string within headerNavLinks { href: __THIS__ }
  title: string
  classes?: string
}

const BookSessionButton: React.FC<BookSessionButtonProps> = ({
  href,
  title,
}) => (
  <Link
    href={href}
    className="group mb-4 relative inline-flex h-[calc(48px+8px)] items-center border-primary-500 dark:border-primary-400 border-4 justify-center rounded-full pl-6 pr-14 font-medium">
    <span className="z-10 font-bold text-xl pr-2 text-black-500 dark:text-white">
      {title}
    </span>
    <div className="absolute right-0 inline-flex h-12 w-12 items-center justify-end rounded-full bg-primary-500 group-hover:bg-gradient-to-r group-hover:from-primary-400 group-hover:to-primary-500 group-hover:via-primary-500 transition-[width] group-hover:w-[calc(100%)]">
      <div className="mr-3.5 flex items-center justify-center">
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 stroke stroke-black dark:stroke-white">
          <path
            d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  </Link>
)

export default BookSessionButton
