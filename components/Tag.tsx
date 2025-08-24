import Link from '@/components/Link'
import { slug } from 'github-slugger'
interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  return (
    <Link
      href={`/tags/${slug(text)}`}
      className="border-primary-400 text-primary-500 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-800 dark:hover:text-primary-400 my-1 mr-3 rounded-lg border p-1 px-2 text-sm font-medium uppercase transition-colors"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
