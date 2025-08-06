'use client'

import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/20/solid'
import Template from '@/components/Template'
import Image from 'next/image'
import Link from 'next/link'
import { questions, type FAQItem } from './questions'
import DynamicGridMasonry from '../masonry/DynamicGridMasonry'

type ContentItem = {
  type: 'text' | 'image' | 'list' | 'link' | 'imageMosaic'
  content?: string
  src?: string
  alt?: string
  width?: number
  height?: number
  items?: string[]
  href?: string
  text?: string
  // DynamicGridMasonry specific properties
  images?: string[] // Array of image URLs
  layout?: 'vertical' | 'horizontal'
  largestColumn?: 'left' | 'right'
  containerHeight?: string
  gap?: string
  imagePosition?: 'left' | 'right' // New: controls image/text order
}

const renderContent = (content: string | ContentItem[]) => {
  if (typeof content === 'string') {
    return <p className="text-gray-700 dark:text-gray-300">{content}</p>
  }

  // Find first image or imageMosaic index
  const firstImageIdx = content.findIndex(
    (item) => item.type === 'image' || item.type === 'imageMosaic'
  )
  const hasImage = firstImageIdx !== -1

  if (hasImage) {
    // Split content into before, image, after
    const before = content.slice(0, firstImageIdx)
    const imageItem = content[firstImageIdx]
    const after = content.slice(firstImageIdx + 1)

    // Determine image position: default left, or use imageItem.imagePosition
    const imagePosition = imageItem.imagePosition || 'left'

    const textCol = (
      <div className="order-1 flex flex-col space-y-3 md:order-none">
        {before.map((item, index) => {
          switch (item.type) {
            case 'text':
              return (
                <p key={index} className="text-gray-700 dark:text-gray-300">
                  {item.content}
                </p>
              )
            case 'list':
              return (
                <ul
                  key={index}
                  className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300"
                >
                  {item.items?.map((listItem, listIndex) => (
                    <li key={listIndex}>{listItem}</li>
                  ))}
                </ul>
              )
            case 'link':
              return (
                <p key={index} className="text-gray-700 dark:text-gray-300">
                  <Link
                    href={item.href!}
                    className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline"
                  >
                    {item.text || item.href}
                  </Link>
                </p>
              )
            default:
              return null
          }
        })}
        {after.map((item, index) => {
          switch (item.type) {
            case 'text':
              return (
                <p key={index + before.length} className="text-gray-700 dark:text-gray-300">
                  {item.content}
                </p>
              )
            case 'list':
              return (
                <ul
                  key={index + before.length}
                  className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300"
                >
                  {item.items?.map((listItem, listIndex) => (
                    <li key={listIndex}>{listItem}</li>
                  ))}
                </ul>
              )
            case 'link':
              return (
                <p key={index + before.length} className="text-gray-700 dark:text-gray-300">
                  <Link
                    href={item.href!}
                    className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline"
                  >
                    {item.text || item.href}
                  </Link>
                </p>
              )
            default:
              return null
          }
        })}
      </div>
    )
    const imageCol = (
      <div className="order-2 flex flex-col items-center md:order-none">
        {imageItem.type === 'image' ? (
          <Image
            src={imageItem.src!}
            alt={imageItem.alt || ''}
            width={imageItem.width || 400}
            height={imageItem.height || 300}
            className="rounded-lg"
          />
        ) : imageItem.type === 'imageMosaic' ? (
          <DynamicGridMasonry
            images={imageItem.images || []}
            layout={imageItem.layout || 'vertical'}
            largestColumn={imageItem.largestColumn || 'left'}
          />
        ) : null}
      </div>
    )

    return (
      <div className="space-y-3 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
        {/* On md+, order by imagePosition; on mobile, always text then image */}
        {imagePosition === 'left' ? (
          <>
            {imageCol}
            {textCol}
          </>
        ) : (
          <>
            {textCol}
            {imageCol}
          </>
        )}
      </div>
    )
  }

  // No image/imageMosaic: fallback to default
  return (
    <div className="space-y-3">
      {content.map((item, index) => {
        switch (item.type) {
          case 'text':
            return (
              <p key={index} className="text-gray-700 dark:text-gray-300">
                {item.content}
              </p>
            )
          case 'list':
            return (
              <ul
                key={index}
                className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300"
              >
                {item.items?.map((listItem, listIndex) => (
                  <li key={listIndex}>{listItem}</li>
                ))}
              </ul>
            )
          case 'link':
            return (
              <p key={index} className="text-gray-700 dark:text-gray-300">
                <Link
                  href={item.href!}
                  className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline"
                >
                  {item.text || item.href}
                </Link>
              </p>
            )
          default:
            return null
        }
      })}
    </div>
  )
}

type FAQCardProps = {
  questions?: FAQItem[]
}

const FAQCard = ({ questions: questionsProp }: FAQCardProps) => {
  const data = questionsProp || questions
  return (
    <div className="w-full pb-6">
      <Template title="Frequently Asked Questions" />
      <div className="flex w-full flex-col items-center justify-center">
        {data.map((item) => (
          <Disclosure as="div" key={item.q} className="w-full pb-4">
            {({ open }) => (
              <>
                <DisclosureButton
                  id={item.id}
                  className="hover:bg-primary-200 focus-visible:ring-primary-500/75 dark:border-primary-400 flex w-full justify-between rounded-lg border bg-none px-4 py-2 text-left font-medium text-gray-900 focus:outline-none focus-visible:ring dark:text-white hover:dark:text-gray-900"
                >
                  <span>{item.q}</span>
                  <ChevronUpIcon
                    className={`${open ? 'rotate-180 transform' : ''} text-primary-500 h-5 w-5`}
                  />
                </DisclosureButton>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <DisclosurePanel className="px-4 pt-4 pb-2">
                    {renderContent(item.a)}
                  </DisclosurePanel>
                </Transition>
              </>
            )}
          </Disclosure>
        ))}
      </div>
    </div>
  )
}

export default FAQCard
