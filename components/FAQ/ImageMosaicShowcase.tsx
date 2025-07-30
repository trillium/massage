// Comprehensive showcase of ImageMosaic layouts and dynamic examples

import { ImageMosaic, type ImageItem } from 'components/FAQ'

// Sample images for testing (reusing the same set)
const showcaseImages: ImageItem[] = [
  { src: '/static/images/foo/A_good_01.webp', alt: 'Sample 1' },
  { src: '/static/images/foo/A_good_02.webp', alt: 'Sample 2' },
  { src: '/static/images/foo/A_good_03.webp', alt: 'Sample 3' },
  { src: '/static/images/foo/A_good_04.webp', alt: 'Sample 4' },
  { src: '/static/images/foo/A_good_05.webp', alt: 'Sample 5' },
  { src: '/static/images/foo/A_good_06.webp', alt: 'Sample 6' },
  { src: '/static/images/foo/A_good_07.webp', alt: 'Sample 7' },
  { src: '/static/images/foo/B_medium_01_better.webp', alt: 'Sample 8' },
  { src: '/static/images/foo/B_medium_01.webp', alt: 'Sample 9' },
  { src: '/static/images/foo/B_medium_02_dupe.webp', alt: 'Sample 10' },
  { src: '/static/images/foo/B_medium_02.webp', alt: 'Sample 11' },
  { src: '/static/images/foo/B_medium_03.webp', alt: 'Sample 12' },
  { src: '/static/images/foo/B_medium_04.webp', alt: 'Sample 13' },
]

// Helper to generate any number of images using duplicates
export const generateImageArray = (count: number): ImageItem[] => {
  const result: ImageItem[] = []
  for (let i = 0; i < count; i++) {
    const sourceImage = showcaseImages[i % showcaseImages.length]
    result.push({
      ...sourceImage,
      alt: `${sourceImage.alt} (${i + 1})`,
    })
  }
  return result
}

// Layout comparison component
export const LayoutComparison = () => (
  <div className="space-y-8 p-6">
    <h2 className="text-2xl font-bold">ImageMosaic Layout Comparison</h2>

    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-semibold">Single Layout</h3>
        <p className="mb-2 text-sm text-gray-600">Perfect for hero images</p>
        <ImageMosaic images={showcaseImages.slice(0, 1)} layout="single" gap="gap-2" />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Two Side-by-Side</h3>
        <p className="mb-2 text-sm text-gray-600">Great for comparisons</p>
        <ImageMosaic images={showcaseImages.slice(0, 2)} layout="two-side-by-side" gap="gap-2" />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Portrait-Landscape Stack</h3>
        <p className="mb-2 text-sm text-gray-600">One main image with supporting images</p>
        <ImageMosaic
          images={showcaseImages.slice(0, 3)}
          layout="portrait-landscape-stack"
          gap="gap-2"
        />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">2x2 Square Grid</h3>
        <p className="mb-2 text-sm text-gray-600">Perfect square grid</p>
        <ImageMosaic images={showcaseImages.slice(0, 4)} layout="2x2-square" gap="gap-2" />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">3x3 Square Grid</h3>
        <p className="mb-2 text-sm text-gray-600">Classic gallery grid</p>
        <ImageMosaic images={showcaseImages.slice(0, 9)} layout="3x3-square" gap="gap-2" />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">Dynamic Layout</h3>
        <p className="mb-2 text-sm text-gray-600">Automatically adapts to any number</p>
        <ImageMosaic images={showcaseImages.slice(0, 7)} layout="dynamic" gap="gap-2" />
      </div>
    </div>
  </div>
)

// Progressive dynamic showcase (1-15 images)
export const DynamicProgressiveShowcase = () => (
  <div className="space-y-8 p-6">
    <h2 className="text-2xl font-bold">Dynamic Layout: 1-15 Images</h2>
    <p className="text-gray-600">
      Watch how the dynamic layout intelligently adapts from 1 to 15 images
    </p>

    <div className="space-y-6">
      {Array.from({ length: 15 }, (_, i) => {
        const imageCount = i + 1
        let gridDescription = ''

        if (imageCount === 1) gridDescription = '1 col'
        else if (imageCount === 2) gridDescription = '1→2 cols'
        else if (imageCount === 3) gridDescription = '1→2→3 cols'
        else if (imageCount === 4) gridDescription = '1→2 cols'
        else if (imageCount <= 6) gridDescription = '2→2→3 cols'
        else if (imageCount <= 9) gridDescription = '2→3 cols'
        else if (imageCount <= 12) gridDescription = '2→3→4 cols'
        else gridDescription = '2→3→4→5 cols'

        return (
          <div key={imageCount} className="space-y-2">
            <h3 className="text-lg font-medium">
              {imageCount} Image{imageCount !== 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-gray-500">Grid progression: {gridDescription}</p>
            <ImageMosaic images={generateImageArray(imageCount)} layout="dynamic" gap="gap-2" />
          </div>
        )
      })}
    </div>
  </div>
)

// Individual dynamic examples
export const DynamicExamples = {
  oneImage: () => <ImageMosaic images={generateImageArray(1)} layout="dynamic" gap="gap-2" />,
  twoImages: () => <ImageMosaic images={generateImageArray(2)} layout="dynamic" gap="gap-2" />,
  threeImages: () => <ImageMosaic images={generateImageArray(3)} layout="dynamic" gap="gap-2" />,
  fourImages: () => <ImageMosaic images={generateImageArray(4)} layout="dynamic" gap="gap-2" />,
  fiveImages: () => <ImageMosaic images={generateImageArray(5)} layout="dynamic" gap="gap-2" />,
  sevenImages: () => <ImageMosaic images={generateImageArray(7)} layout="dynamic" gap="gap-2" />,
  tenImages: () => <ImageMosaic images={generateImageArray(10)} layout="dynamic" gap="gap-2" />,
  fifteenImages: () => <ImageMosaic images={generateImageArray(15)} layout="dynamic" gap="gap-2" />,
}

// Complete showcase component combining everything
export const CompleteImageMosaicShowcase = () => (
  <div className="space-y-12">
    <LayoutComparison />
    <DynamicProgressiveShowcase />
  </div>
)

export default CompleteImageMosaicShowcase
