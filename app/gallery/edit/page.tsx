'use client'

import { useState } from 'react'
import Image from '@/components/Image'
import SectionContainer from '@/components/SectionContainer'
import { IoClose } from 'react-icons/io5'

interface GalleryImage {
  src: string
  alt: string
}

const initialImages: GalleryImage[] = [
  { src: '/static/images/gallery/_retouched_focus_happy_neck_massage.jpg', alt: 'Neck massage' },
  { src: '/static/images/gallery/neck_holding_content.jpg', alt: 'Neck holding technique' },
  { src: '/static/images/gallery/neck_massage_happy_relaxed.jpg', alt: 'Relaxed neck massage' },
  {
    src: '/static/images/gallery/c9124adec3c5fb39f466158c76cf86d8-large.jpg',
    alt: 'Massage session',
  },
  { src: '/static/images/gallery/scalp_massage_focused.jpg', alt: 'Scalp massage' },
  {
    src: '/static/images/gallery/f46cd959a0919065b60c68ee1bc03f53-large.jpg',
    alt: 'Massage session',
  },
  { src: '/static/images/gallery/hands_on_back.jpg', alt: 'Hands on back' },
  { src: '/static/images/gallery/_retouched_focus_elbow_back.jpg', alt: 'Elbow back technique' },
  {
    src: '/static/images/gallery/7c510239e56e5995f8a804ed63e0dac2-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/75096f2ddf1a6d720297dcdb93da4fca-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/c77106eb3b6c89d15037ba95ff73cc2f-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/514386467f70a1fc77d8ad5c36cccf88-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/_retouched_leg_massage_hands_cross_over.jpg',
    alt: 'Leg massage crossover technique',
  },
  { src: '/static/images/gallery/foot_rub_focused.jpg', alt: 'Foot rub' },
  { src: '/static/images/gallery/_retouched_focus_foot.jpg', alt: 'Foot massage' },
  { src: '/static/images/gallery/leg_massage_focused_landscape.jpg', alt: 'Leg massage' },
  {
    src: '/static/images/gallery/28f3419fd0a9f5ecba7592f84c26efed-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/38c8863aa34f1acf6f88546fabcd3081-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/a9f3b74c91045064d52f0d15741d0994-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/eb73d99b0b15b7be1d4a5e392b382dc6-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/eb3963a1e0a370d741fdabc3cde63048-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/0b13e1c2a38fb29ce73ae673e287cdab-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/426d5c406a4409455fc44509fc5d8274-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/_retouched_focus_chair_massage_elbow.jpg',
    alt: 'Chair massage elbow technique',
  },
  { src: '/static/images/gallery/chair_massage_happy.jpg', alt: 'Chair massage' },
  {
    src: '/static/images/gallery/41aee5a1780d995e30cddbb70762db2b-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/280abffd34fbb5df5de4ead89821bf13-large.jpg',
    alt: 'Massage session',
  },
  {
    src: '/static/images/gallery/a46d7ce823d6ae558684f52c206e0f4c-large.jpg',
    alt: 'Massage session',
  },
  { src: '/static/images/gallery/headshot_hat.jpg', alt: 'Trillium with hat' },
  { src: '/static/images/gallery/_retouched_photo_arms_hat.jpg', alt: 'Trillium portrait' },
  {
    src: '/static/images/gallery/44d2227fc9d4193835f67e1d0c98bc5c-large.jpg',
    alt: 'Massage session',
  },
  { src: '/static/images/gallery/_retouched_no_hat_headshot.jpg', alt: 'Trillium headshot' },
  {
    src: '/static/images/gallery/005994cb32463dd19f5e74544748843b-large.jpg',
    alt: 'Massage session',
  },
]

const initialHidden = new Set([
  '/static/images/gallery/c9124adec3c5fb39f466158c76cf86d8-large.jpg',
  '/static/images/gallery/_retouched_focus_elbow_back.jpg',
  '/static/images/gallery/0b13e1c2a38fb29ce73ae673e287cdab-large.jpg',
  '/static/images/gallery/005994cb32463dd19f5e74544748843b-large.jpg',
  '/static/images/gallery/_retouched_photo_arms_hat.jpg',
])

function swap(arr: GalleryImage[], i: number, j: number): GalleryImage[] {
  const next = [...arr]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export default function Page() {
  const [images, setImages] = useState(initialImages)
  const [hidden, setHidden] = useState<Set<string>>(initialHidden)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const visibleImages = images.filter((img) => !hidden.has(img.src))

  function move(index: number, direction: 'up' | 'down') {
    const visImg = visibleImages[index]
    const realIndex = images.findIndex((img) => img.src === visImg.src)
    const step = direction === 'up' ? -1 : 1
    let target = realIndex + step
    while (target >= 0 && target < images.length && hidden.has(images[target].src)) {
      target += step
    }
    if (target < 0 || target >= images.length) return
    const next = swap(images, realIndex, target)
    setImages(next)
    save(next, hidden)
  }

  function toggleHide(src: string) {
    const next = new Set(hidden)
    if (next.has(src)) {
      next.delete(src)
    } else {
      next.add(src)
    }
    setHidden(next)
    save(images, next)
  }

  async function save(imgs: GalleryImage[], hiddenSet: Set<string>) {
    setSaving(true)
    setSaveError(false)
    try {
      const res = await fetch('/api/gallery/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imgs, hidden: [...hiddenSet] }),
      })
      if (!res.ok) setSaveError(true)
    } catch {
      setSaveError(true)
    }
    setSaving(false)
  }

  return (
    <SectionContainer>
      <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
        <span>
          {saving ? 'Saving...' : `${visibleImages.length} visible, ${hidden.size} hidden`}
        </span>
        {saveError && <span className="text-red-500">Save failed (read-only?)</span>}
        {hidden.size > 0 && (
          <button
            onClick={() => {
              setHidden(new Set())
              save(images, new Set())
            }}
            className="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700"
          >
            Show all
          </button>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {visibleImages.map((image, index) => (
          <div
            key={image.src}
            className="relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700"
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={600}
              height={600}
              className="h-auto w-full object-cover"
            />
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              {index > 0 && (
                <button
                  onClick={() => move(index, 'up')}
                  className="rounded bg-black/60 px-3 py-2 text-xl text-white backdrop-blur-sm"
                >
                  ↑
                </button>
              )}
              {index < visibleImages.length - 1 && (
                <button
                  onClick={() => move(index, 'down')}
                  className="rounded bg-black/60 px-3 py-2 text-xl text-white backdrop-blur-sm"
                >
                  ↓
                </button>
              )}
            </div>
            <div className="absolute top-2 left-2">
              <button
                onClick={() => toggleHide(image.src)}
                className="rounded bg-red-600/80 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm"
              >
                <IoClose />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 bg-black/50 px-2 py-1 text-xs text-white">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  )
}
