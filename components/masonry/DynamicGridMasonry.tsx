// DynamicGridMasonry: Responsive masonry grid for images, with column logic for 1-4+ images.
// Uses Tailwind/Flowbite grid utilities and supports square aspect ratio images.
import Image from '@/components/Image'
import clsx from 'clsx'

// Example image file paths for demonstration
export const files = [
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

// Props:
// - images: array of image URLs
// - layout: (future) vertical/horizontal layout option
interface DynamicGridMasonryProps {
  images?: string[]
  layout?: 'vertical' | 'horizontal'
  largestColumn?: 'left' | 'right'
}

// Only vertical layout is implemented for now
export default function DynamicGridMasonry(props: DynamicGridMasonryProps) {
  const { images = files, layout = 'vertical', largestColumn = 'left' } = props
  // For simplicity, only vertical layout is implemented here
  const count = images.length

  if (count === 0) return null

  // 1 column for 1 image, 2 columns for 2-4 images, 4 columns for >4 images
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

  // Helper to split images into columns
  function splitIntoColumns(arr: string[], columns: number) {
    const cols: string[][] = Array.from({ length: columns }, () => [])
    arr.forEach((img, i) => {
      cols[i % columns].push(img)
    })
    return cols
  }

  // For 1-4 images, balance columns
  let columns: string[][]
  if (count === 1) {
    columns = [[images[0]]]
  } else if (count === 2) {
    columns = [[images[0]], [images[1]]]
  } else if (count === 3) {
    columns = [[images[0], images[1]], [images[2]]]
  } else if (count === 4) {
    columns = [
      [images[0], images[1]],
      [images[2], images[3]],
    ]
  } else {
    columns = splitIntoColumns(images, colCount)
  }

  // Optionally reverse columns if largestColumn is 'right' and columns are uneven
  let displayColumns = columns
  if (
    largestColumn === 'right' &&
    columns.length === 2 &&
    columns[0].length !== columns[1].length
  ) {
    displayColumns = [...columns].reverse()
  }

  return (
    <div className={gridClass}>
      {displayColumns.map((col, i) => (
        <div className="grid gap-4" key={i}>
          {col.map((src, j) => (
            <FlowbiteImageCell src={src} key={j} />
          ))}
        </div>
      ))}
    </div>
  )
}

function FlowbiteImageCell({ src }: { src: string }) {
  return (
    <div className="h-full min-h-[200px] w-full">
      {/* Renders a single image cell that fills its grid container */}
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
