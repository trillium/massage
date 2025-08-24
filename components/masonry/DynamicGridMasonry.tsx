import Image from '@/components/Image'
import clsx from 'clsx'

interface DynamicGridMasonryProps {
  images?: string[]
  layout?: 'vertical' | 'horizontal'
  largestColumn?: 'left' | 'right'
}

const defaultImages = [
  '/static/images/table/table_square_01.webp',
  '/static/images/table/table_square_02.webp',
  '/static/images/table/table_square_03.webp',
  '/static/images/chair/chair_square_07.webp',
]

function FlowbiteImageCell({ src }: { src: string }) {
  return (
    <div className="h-full min-h-[200px] w-full">
      <Image
        className="h-full w-full rounded-lg object-cover"
        src={src}
        alt=""
        width={400}
        height={300}
        sizes="(max-width: 768px) 50vw, 25vw"
      />
    </div>
  )
}

export default function DynamicGridMasonry({
  images = defaultImages,
  layout = 'vertical',
  largestColumn = 'left',
}: DynamicGridMasonryProps) {
  const count = images.length

  if (count === 0) return null

  let colCount = 2
  if (count === 1) {
    colCount = 1
  } else if (count > 4) {
    colCount = 4
  }

  const gridClass = clsx('grid gap-4', {
    'grid-cols-1': colCount === 1,
    'grid-cols-2': colCount === 2,
    'grid-cols-4': colCount === 4,
  })

  function splitIntoColumns(arr: string[], columns: number) {
    const cols: string[][] = Array.from({ length: columns }, () => [])
    arr.forEach((img, i) => {
      cols[i % columns].push(img)
    })
    return cols
  }

  let columns = splitIntoColumns(images, colCount)

  if (
    largestColumn === 'right' &&
    columns.length === 2 &&
    columns[0].length !== columns[1].length
  ) {
    columns = [...columns].reverse()
  }

  return (
    <div className={gridClass}>
      {columns.map((col, i) => (
        <div className="grid gap-4" key={i}>
          {col.map((src, j) => (
            <FlowbiteImageCell src={src} key={j} />
          ))}
        </div>
      ))}
    </div>
  )
}
