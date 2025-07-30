import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'

export type ImageItem = {
  src: string
  alt: string
  href?: string
  width?: number
  height?: number
}

export type MosaicLayout =
  | 'single'
  | 'two-side-by-side'
  | 'portrait-landscape-stack'
  | '2x2-square'
  | '3x3-square'
  | 'dynamic'

type ImageMosaicProps = {
  images: ImageItem[]
  layout: MosaicLayout
  className?: string
  containerHeight?: string
  gap?: string
}

const ImageMosaic = ({
  images,
  layout,
  className = '',
  containerHeight = 'h-96',
  gap = 'gap-1 sm:gap-2',
}: ImageMosaicProps) => {
  const getAspectRatioClass = (layout: MosaicLayout) => {
    switch (layout) {
      case 'single':
        return 'aspect-video' // 16:9 for single images
      case 'two-side-by-side':
        return 'aspect-square' // 1:1 for side by side
      case 'portrait-landscape-stack':
        return 'aspect-[4/3]' // 4:3 for mixed layout
      case '2x2-square':
      case '3x3-square':
        return 'aspect-square' // 1:1 for grid layouts
      case 'dynamic':
        return 'aspect-square' // 1:1 for dynamic responsive grids
      default:
        return 'aspect-square'
    }
  }

  const renderImage = (image: ImageItem, index: number, additionalClasses = '') => {
    const imageElement = (
      <div
        key={index}
        className={clsx(
          'relative overflow-hidden rounded-lg',
          getAspectRatioClass(layout),
          additionalClasses
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    )

    if (image.href) {
      return (
        <Link key={index} href={image.href} className={clsx(additionalClasses)}>
          {imageElement}
        </Link>
      )
    }

    return imageElement
  }

  const getDynamicGridClasses = (imageCount: number) => {
    // Responsive grid that adapts based on image count and screen size
    if (imageCount === 1) {
      return 'grid grid-cols-1'
    } else if (imageCount === 2) {
      return 'grid grid-cols-1 xs:grid-cols-2'
    } else if (imageCount === 3) {
      return 'grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3'
    } else if (imageCount === 4) {
      return 'grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2'
    } else if (imageCount <= 6) {
      return 'grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3'
    } else if (imageCount <= 9) {
      return 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3'
    } else if (imageCount <= 12) {
      return 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4'
    } else {
      // For very large sets, use a responsive grid that maxes out at 5 columns
      return 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
    }
  }

  const getLayoutClasses = () => {
    switch (layout) {
      case 'single':
        return clsx('grid grid-cols-1', gap)
      case 'two-side-by-side':
        return clsx('grid grid-cols-2 sm:grid-cols-2', gap)
      case 'portrait-landscape-stack':
        // On mobile: 2 cols, on md+: use 3 cols/2 rows
        return clsx('grid grid-cols-2 sm:grid-cols-3 sm:grid-rows-2', gap)
      case '2x2-square':
        return clsx(
          'grid grid-cols-1 xs:grid-cols-2 xs:grid-rows-2 sm:grid-cols-2 sm:grid-rows-2',
          gap
        )
      case '3x3-square':
        return clsx(
          'grid grid-cols-2 xs:grid-cols-3 xs:grid-rows-3 sm:grid-cols-3 sm:grid-rows-3',
          gap
        )
      case 'dynamic':
        return clsx(getDynamicGridClasses(images.length), gap)
      default:
        return clsx('grid grid-cols-1', gap)
    }
  }

  const renderLayout = () => {
    switch (layout) {
      case 'single':
        return images.slice(0, 1).map((image, index) => renderImage(image, index))

      case 'two-side-by-side':
        return images.slice(0, 2).map((image, index) => renderImage(image, index))

      case 'portrait-landscape-stack':
        // Mobile (2 cols): First image spans both columns, others are side by side
        // Desktop (3 cols/2 rows): First image portrait (left, spans 2 rows), others landscape (right)
        return [
          images[0] && renderImage(images[0], 0, 'col-span-2 sm:row-span-2 sm:col-span-1'),
          images[1] && renderImage(images[1], 1, 'col-span-1 sm:row-span-1 sm:col-span-2'),
          images[2] && renderImage(images[2], 2, 'col-span-1 sm:row-span-1 sm:col-span-2'),
        ]

      case '2x2-square':
        return images.slice(0, 4).map((image, index) => renderImage(image, index))

      case '3x3-square':
        // On xs (2 cols): images 0-7 fill normally, image 8 spans both columns
        // On sm+ (3 cols): all images fill normally in 3x3 grid
        return images.slice(0, 9).map((image, index) => {
          if (index === 8) {
            // Last image spans full width on xs, normal on sm+
            return renderImage(image, index, 'col-span-2 xs:col-span-1')
          }
          return renderImage(image, index)
        })

      case 'dynamic':
        // Dynamic layout renders all images with smart responsive behavior
        return images.map((image, index) => {
          const imageCount = images.length

          // Special handling for odd numbers at certain breakpoints
          if (imageCount === 3 && index === 2) {
            // Last image in 3-image set spans full width on mobile
            return renderImage(image, index, 'col-span-1 xs:col-span-2 sm:col-span-1')
          } else if (imageCount === 5 && index === 4) {
            // Last image in 5-image set spans 2 columns on xs, 1 on sm+
            return renderImage(image, index, 'col-span-2 xs:col-span-2 sm:col-span-1')
          } else if (imageCount === 7 && index === 6) {
            // Last image in 7-image set spans full width on xs
            return renderImage(image, index, 'col-span-2 xs:col-span-1')
          } else if (imageCount === 10 && index === 9) {
            // Last image in 10-image set spans 2 columns on xs
            return renderImage(image, index, 'col-span-2 xs:col-span-1')
          } else if (imageCount === 11 && index >= 9) {
            // Last 2 images in 11-image set span full width on xs
            return renderImage(image, index, 'col-span-2 xs:col-span-1')
          }

          return renderImage(image, index)
        })

      default:
        return images.slice(0, 1).map((image, index) => renderImage(image, index))
    }
  }

  if (!images || images.length === 0) {
    return (
      <div
        className={clsx(
          getLayoutClasses(),
          className,
          'flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700'
        )}
      >
        <p className="text-gray-500 dark:text-gray-400">No images available</p>
      </div>
    )
  }

  return <div className={clsx(getLayoutClasses(), className)}>{renderLayout()}</div>
}

export default ImageMosaic
