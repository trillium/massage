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
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {columns.map((column, columnIndex) => {
        return (
          <div key={columnIndex} className="flex flex-col gap-2">
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
      className={clsx('relative overflow-hidden rounded-lg', { 'h-48': !short }, { 'h-24': short })}
    >
      <img className="absolute h-full w-full rounded-lg object-cover" src={src} alt="" />
    </div>
  )
}
