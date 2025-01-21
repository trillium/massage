import Image from '@/components/Image'
import clsx from 'clsx'

const files = [
  '/static/images/foo/A_good_01.webp',
  '/static/images/foo/A_good_02.webp',
  '/static/images/foo/A_good_03.webp',
  '/static/images/foo/A_good_04.webp',
  '/static/images/foo/A_good_05.webp',
  '/static/images/foo/A_good_06.webp',
  '/static/images/foo/A_good_07.webp',
  '/static/images/foo/B_medium_01.webp',
  '/static/images/foo/B_medium_01_better.webp',
  '/static/images/foo/B_medium_02.webp',
  '/static/images/foo/B_medium_02_dupe.webp',
  '/static/images/foo/B_medium_03.webp',
  '/static/images/foo/B_medium_04.webp',
  '/static/images/foo/B_medium_02_dupe.webp',
  '/static/images/foo/B_medium_03.webp',
  '/static/images/foo/B_medium_04.webp',
]

export default function Masonry({}) {
  const columns: string[][] = [[], [], [], []]

  files.forEach((file, index) => {
    columns[index % 4].push(file)
  })

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {columns.map((column, columnIndex) => {
        return (
          <div key={columnIndex} className="grid grid-flow-dense grid-cols-1  gap-4">
            {' '}
            {column.map((url, index, array) => {
              const first = index === 0 + (columnIndex % 2)
              const last = index === array.length - 1

              const short = columnIndex % 2 === 0 && index === 0

              return <ImageCell key={url} src={url} short={short} />
            })}
          </div>
        )
      })}
    </div>
  )
}

function ImageCell({ src, short }) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-lg',
        { 'h-48 border-2 border-primary-600': !short },
        { 'h-24 border-2 border-red-600': short }
      )}
    >
      <img className="absolute h-full w-full rounded-lg object-cover" src={src} alt="" />
    </div>
  )
}
