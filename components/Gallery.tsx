'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { IoClose, IoChevronBack, IoChevronForward } from 'react-icons/io5'
import Image from '@/components/Image'
import { TextSm, TextSmMedium } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

export interface GalleryImage {
  src: string
  alt: string
  caption?: string
  objectPosition?: string
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
      <Box className={`${columnClasses[columns]} gap-4`}>
        {images.map((image, index) => (
          <Button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="group hover:outline-primary-500 focus-visible:outline-primary-500 mb-4 block h-auto w-full cursor-pointer break-inside-avoid overflow-hidden rounded-lg border-0 bg-transparent p-0 outline-2 outline-offset-4 outline-transparent transition-[outline-color] duration-200"
          >
            <Box className="border-primary-500 relative overflow-hidden rounded-lg border-2">
              <Image
                src={image.src}
                alt={image.alt}
                width={0}
                height={0}
                className="block h-auto w-full"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {image.caption && (
                <Box className="absolute right-0 bottom-0 left-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                  <TextSmMedium>{image.caption}</TextSmMedium>
                </Box>
              )}
            </Box>
          </Button>
        ))}
      </Box>

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
            <Box className="fixed inset-0 bg-black/80" />
          </TransitionChild>

          <Stack className="fixed inset-0 z-10 p-4" direction="row" align="center" justify="center">
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
                <Button
                  type="button"
                  className="absolute -top-10 right-0 rounded-full bg-surface-50/80 p-1 backdrop-blur-sm transition-colors hover:bg-surface-50"
                  onClick={() => setSelectedIndex(null)}
                >
                  <IoClose className="h-5 w-5 text-accent-900" />
                </Button>

                <Button
                  type="button"
                  className="absolute top-1/2 -left-12 -translate-y-1/2 rounded-full bg-surface-50/80 p-2 backdrop-blur-sm transition-colors hover:bg-surface-50 max-sm:-left-2 max-sm:bg-surface-50/60"
                  onClick={goPrev}
                >
                  <IoChevronBack className="h-5 w-5 text-accent-900" />
                </Button>

                <Button
                  type="button"
                  className="absolute top-1/2 -right-12 -translate-y-1/2 rounded-full bg-surface-50/80 p-2 backdrop-blur-sm transition-colors hover:bg-surface-50 max-sm:-right-2 max-sm:bg-surface-50/60"
                  onClick={goNext}
                >
                  <IoChevronForward className="h-5 w-5 text-accent-900" />
                </Button>

                {selectedIndex !== null && (
                  <Box className="relative">
                    <Image
                      src={images[selectedIndex].src}
                      alt={images[selectedIndex].alt}
                      width={1200}
                      height={1200}
                      className="h-auto max-h-[85vh] w-full rounded-lg object-contain"
                      sizes="95vw"
                    />
                    {images[selectedIndex].caption && (
                      <Box className="absolute right-0 bottom-0 left-0 rounded-b-lg bg-gradient-to-t from-black/70 to-transparent p-4">
                        <TextSm className="text-center">{images[selectedIndex].caption}</TextSm>
                      </Box>
                    )}
                  </Box>
                )}
              </DialogPanel>
            </TransitionChild>
          </Stack>
        </Dialog>
      </Transition>
    </>
  )
}
