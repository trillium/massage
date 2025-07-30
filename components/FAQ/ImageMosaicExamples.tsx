// Example usage of ImageMosaic component

import { ImageMosaic, type ImageItem, type MosaicLayout } from 'components/FAQ'
import type { FAQItem } from 'components/FAQ/questions'

// Example image data
const sampleImages: ImageItem[] = [
  {
    src: '/static/images/foo/A_good_01.webp',
    alt: 'A good 01',
  },
  {
    src: '/static/images/foo/A_good_02.webp',
    alt: 'A good 02',
  },
  {
    src: '/static/images/foo/A_good_03.webp',
    alt: 'A good 03',
  },
  {
    src: '/static/images/foo/A_good_04.webp',
    alt: 'A good 04',
  },
  {
    src: '/static/images/foo/A_good_05.webp',
    alt: 'A good 05',
  },
  {
    src: '/static/images/foo/A_good_06.webp',
    alt: 'A good 06',
  },
  {
    src: '/static/images/foo/A_good_07.webp',
    alt: 'A good 07',
  },
  {
    src: '/static/images/foo/B_medium_01_better.webp',
    alt: 'B medium 01 better',
  },
  {
    src: '/static/images/foo/B_medium_01.webp',
    alt: 'B medium 01',
  },
  {
    src: '/static/images/foo/B_medium_02_dupe.webp',
    alt: 'B medium 02 dupe',
  },
  {
    src: '/static/images/foo/B_medium_02.webp',
    alt: 'B medium 02',
  },
  {
    src: '/static/images/foo/B_medium_03.webp',
    alt: 'B medium 03',
  },
  {
    src: '/static/images/foo/B_medium_04.webp',
    alt: 'B medium 04',
  },
]

// Usage examples:

// Single image
const SingleImageExample = () => (
  <ImageMosaic images={sampleImages.slice(0, 1)} layout="single" containerHeight="h-64" />
)

// Two side by side images
const TwoSideBySideExample = () => (
  <ImageMosaic images={sampleImages.slice(0, 2)} layout="two-side-by-side" containerHeight="h-80" />
)

// Portrait with landscape stack
const PortraitLandscapeExample = () => (
  <ImageMosaic
    images={sampleImages.slice(0, 3)}
    layout="portrait-landscape-stack"
    containerHeight="h-96"
  />
)

// 2x2 square grid
const TwoByTwoExample = () => (
  <ImageMosaic images={sampleImages.slice(0, 4)} layout="2x2-square" containerHeight="h-80" />
)

// 3x3 square grid
const ThreeByThreeExample = () => (
  <ImageMosaic images={sampleImages} layout="3x3-square" containerHeight="h-96" gap="gap-1" />
)

// Dynamic layout examples
const DynamicOneImageExample = () => (
  <ImageMosaic images={sampleImages.slice(0, 1)} layout="dynamic" gap="gap-2" />
)

const DynamicTwoImagesExample = () => (
  <ImageMosaic images={sampleImages.slice(0, 2)} layout="dynamic" gap="gap-2" />
)

const DynamicThreeImagesExample = () => (
  <ImageMosaic images={sampleImages.slice(0, 3)} layout="dynamic" gap="gap-2" />
)

const DynamicFiveImagesExample = () => (
  <ImageMosaic images={sampleImages.slice(0, 5)} layout="dynamic" gap="gap-2" />
)

const DynamicSevenImagesExample = () => (
  <ImageMosaic images={sampleImages.slice(0, 7)} layout="dynamic" gap="gap-2" />
)

// Dynamic layout showcase - 1 to 15 images using duplicates
const generateImageArray = (count: number): ImageItem[] => {
  const result: ImageItem[] = []
  for (let i = 0; i < count; i++) {
    const sourceImage = sampleImages[i % sampleImages.length]
    result.push({
      ...sourceImage,
      alt: `${sourceImage.alt} - ${i + 1}`,
    })
  }
  return result
}

// Individual dynamic examples for each count
const DynamicShowcaseExamples = {
  oneImage: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 1 Image</h3>
      <ImageMosaic images={generateImageArray(1)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  twoImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 2 Images</h3>
      <ImageMosaic images={generateImageArray(2)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  threeImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 3 Images</h3>
      <ImageMosaic images={generateImageArray(3)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  fourImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 4 Images</h3>
      <ImageMosaic images={generateImageArray(4)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  fiveImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 5 Images</h3>
      <ImageMosaic images={generateImageArray(5)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  sixImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 6 Images</h3>
      <ImageMosaic images={generateImageArray(6)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  sevenImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 7 Images</h3>
      <ImageMosaic images={generateImageArray(7)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  eightImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 8 Images</h3>
      <ImageMosaic images={generateImageArray(8)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  nineImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 9 Images</h3>
      <ImageMosaic images={generateImageArray(9)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  tenImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 10 Images</h3>
      <ImageMosaic images={generateImageArray(10)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  elevenImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 11 Images</h3>
      <ImageMosaic images={generateImageArray(11)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  twelveImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 12 Images</h3>
      <ImageMosaic images={generateImageArray(12)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  thirteenImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 13 Images</h3>
      <ImageMosaic images={generateImageArray(13)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  fourteenImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 14 Images</h3>
      <ImageMosaic images={generateImageArray(14)} layout="dynamic" gap="gap-2" />
    </div>
  ),
  fifteenImages: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dynamic Layout: 15 Images</h3>
      <ImageMosaic images={generateImageArray(15)} layout="dynamic" gap="gap-2" />
    </div>
  ),
}

// Comprehensive layout comparison
const LayoutComparisonShowcase = () => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold">ImageMosaic Layout Comparison</h2>

    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Single Layout</h3>
        <p className="mb-2 text-sm text-gray-600">Perfect for hero images or featured content</p>
        <ImageMosaic images={sampleImages.slice(0, 1)} layout="single" gap="gap-2" />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Two Side-by-Side Layout</h3>
        <p className="mb-2 text-sm text-gray-600">Great for before/after comparisons</p>
        <ImageMosaic images={sampleImages.slice(0, 2)} layout="two-side-by-side" gap="gap-2" />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Portrait-Landscape Stack Layout</h3>
        <p className="mb-2 text-sm text-gray-600">
          Emphasizes one main image with supporting images
        </p>
        <ImageMosaic
          images={sampleImages.slice(0, 3)}
          layout="portrait-landscape-stack"
          gap="gap-2"
        />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">2x2 Square Layout</h3>
        <p className="mb-2 text-sm text-gray-600">Perfect square grid for equal emphasis</p>
        <ImageMosaic images={sampleImages.slice(0, 4)} layout="2x2-square" gap="gap-2" />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">3x3 Square Layout</h3>
        <p className="mb-2 text-sm text-gray-600">Classic grid for galleries and portfolios</p>
        <ImageMosaic images={sampleImages.slice(0, 9)} layout="3x3-square" gap="gap-2" />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Dynamic Layout (3 Images)</h3>
        <p className="mb-2 text-sm text-gray-600">Automatically adapts to any number of images</p>
        <ImageMosaic images={sampleImages.slice(0, 3)} layout="dynamic" gap="gap-2" />
      </div>
    </div>
  </div>
)

// Progressive dynamic showcase component
const DynamicProgressiveShowcase = () => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold">Dynamic Layout Progressive Showcase</h2>
    <p className="text-gray-600">
      Watch how the dynamic layout intelligently adapts from 1 to 15 images
    </p>

    <div className="space-y-6">
      {Array.from({ length: 15 }, (_, i) => {
        const imageCount = i + 1
        return (
          <div key={imageCount} className="space-y-2">
            <h3 className="text-lg font-medium">
              {imageCount} Image{imageCount !== 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-gray-500">
              Grid:{' '}
              {imageCount === 1
                ? '1 col'
                : imageCount === 2
                  ? '1→2 cols'
                  : imageCount === 3
                    ? '1→2→3 cols'
                    : imageCount === 4
                      ? '1→2 cols'
                      : imageCount <= 6
                        ? '2→2→3 cols'
                        : imageCount <= 9
                          ? '2→3 cols'
                          : imageCount <= 12
                            ? '2→3→4 cols'
                            : '2→3→4→5 cols'}
            </p>
            <ImageMosaic images={generateImageArray(imageCount)} layout="dynamic" gap="gap-2" />
          </div>
        )
      })}
    </div>
  </div>
)

// In FAQ content with imageMosaic type:
const exampleFAQWithImages: FAQItem = {
  id: 'equipment_showcase',
  q: 'What equipment do you bring for massage sessions?',
  a: [
    {
      type: 'text',
      content: 'I bring professional-grade equipment to ensure your comfort:',
    },
    {
      type: 'imageMosaic',
      images: sampleImages.slice(0, 4).map((img) => img.src), // Convert to string array
      layout: 'vertical',
      largestColumn: 'left',
    },
    {
      type: 'text',
      content: 'All equipment is thoroughly sanitized between sessions.',
    },
  ],
}

export {
  SingleImageExample,
  TwoSideBySideExample,
  PortraitLandscapeExample,
  TwoByTwoExample,
  ThreeByThreeExample,
  DynamicOneImageExample,
  DynamicTwoImagesExample,
  DynamicThreeImagesExample,
  DynamicFiveImagesExample,
  DynamicSevenImagesExample,
  DynamicShowcaseExamples,
  LayoutComparisonShowcase,
  DynamicProgressiveShowcase,
  generateImageArray,
  exampleFAQWithImages,
}
