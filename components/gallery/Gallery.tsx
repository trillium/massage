import { useState } from 'react'
import { Dialog, DialogCloseButton } from './Dialog'

export interface GalleryImage {
  src: string
  alt: string
  caption?: string
}

interface GalleryProps {
  images: GalleryImage[]
  columns?: 2 | 3 | 4
}

const columnClasses = {
  2: 'columns-1 sm:columns-2',
  3: 'columns-1 sm:columns-2 lg:columns-3',
  4: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4',
}

export const Gallery = ({ images, columns = 3 }: GalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <>
      <div className={`${columnClasses[columns]} gap-4`}>
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg group cursor-pointer border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-medium text-white">{image.caption}</p>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={() => setSelectedIndex(null)}
        maxWidth="max-w-4xl"
        transparent
      >
        {selectedIndex !== null && (
          <div className="relative">
            <DialogCloseButton onClick={() => setSelectedIndex(null)} transparent />
            <img
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
            {images[selectedIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                <p className="text-sm text-white text-center">{images[selectedIndex].caption}</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  )
}
