'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { IoClose, IoChevronBack, IoChevronForward } from 'react-icons/io5'
import Image from '@/components/Image'

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

export default function Gallery({ images, columns = 3 }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i !== null ? (i + 1) % images.length : null))
  }, [images.length])

  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null))
  }, [images.length])

  useEffect(() => {
    if (selectedIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIndex, goNext, goPrev])

  return (
    <>
      <div className={`${columnClasses[columns]} gap-4`}>
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="group hover:outline-primary-500 focus-visible:outline-primary-500 mb-4 block w-full cursor-pointer break-inside-avoid overflow-hidden rounded-lg border-0 bg-transparent p-0 outline-2 outline-offset-4 outline-transparent transition-[outline-color] duration-200"
          >
            <div className="border-primary-500 relative overflow-hidden rounded-lg border-2">
              <Image
                src={image.src}
                alt={image.alt}
                width={600}
                height={600}
                className="h-auto w-full object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {image.caption && (
                <div className="absolute right-0 bottom-0 left-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                  <p className="text-sm font-medium text-white">{image.caption}</p>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <Transition show={selectedIndex !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedIndex(null)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </TransitionChild>

          <div className="fixed inset-0 z-10 flex items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="relative w-[95vw] max-w-4xl">
                <button
                  type="button"
                  className="absolute -top-10 right-0 rounded-full bg-white/80 p-1 backdrop-blur-sm transition-colors hover:bg-white"
                  onClick={() => setSelectedIndex(null)}
                >
                  <IoClose className="h-5 w-5 text-gray-900" />
                </button>

                <button
                  type="button"
                  className="absolute top-1/2 -left-12 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-colors hover:bg-white max-sm:-left-2 max-sm:bg-white/60"
                  onClick={goPrev}
                >
                  <IoChevronBack className="h-5 w-5 text-gray-900" />
                </button>

                <button
                  type="button"
                  className="absolute top-1/2 -right-12 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur-sm transition-colors hover:bg-white max-sm:-right-2 max-sm:bg-white/60"
                  onClick={goNext}
                >
                  <IoChevronForward className="h-5 w-5 text-gray-900" />
                </button>

                {selectedIndex !== null && (
                  <div className="relative">
                    <Image
                      src={images[selectedIndex].src}
                      alt={images[selectedIndex].alt}
                      width={1200}
                      height={1200}
                      className="h-auto max-h-[85vh] w-full rounded-lg object-contain"
                      sizes="95vw"
                    />
                    {images[selectedIndex].caption && (
                      <div className="absolute right-0 bottom-0 left-0 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-center text-sm text-white">
                          {images[selectedIndex].caption}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
