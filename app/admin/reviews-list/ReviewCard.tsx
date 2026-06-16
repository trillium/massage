import { FaStar, FaRegStar } from 'react-icons/fa'
import { ReviewFormFields, type ReviewFormData } from './ReviewFormFields'
import { TextSm, TextXsMuted } from '@/components/ui/text'

import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { Box } from '@/components/ui/box'

interface Review {
  id: number
  name: string
  rating: number
  date: string
  source: string
  comment?: string
  type?: string
}

export function ReviewCard({
  review,
  editing,
  editForm,
  saving,
  onEdit,
  onSave,
  onCancel,
  onEditFormChange,
}: {
  review: Review
  editing: boolean
  editForm: ReviewFormData
  saving: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onEditFormChange: (form: ReviewFormData) => void
}) {
  if (editing) {
    return (
      <Box className="space-y-3 rounded-lg bg-surface-50 p-4 shadow dark:bg-surface-800">
        <ReviewFormFields form={editForm} onChange={onEditFormChange} variant="edit" />
        <Stack direction="row" gap={2}>
          <Button
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:bg-surface-300"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={onCancel}
            className="rounded-md border border-accent-300 px-3 py-1.5 text-sm text-accent-700 hover:bg-surface-100 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-700"
          >
            Cancel
          </Button>
        </Stack>
      </Box>
    )
  }

  return (
    <Box className="rounded-lg bg-surface-50 p-4 shadow dark:bg-surface-800">
      <Stack direction="row" align="start" justify="between">
        <Box>
          <Stack direction="row" align="center" gap={2}>
            <span className="font-semibold text-accent-800 dark:text-accent-200">
              {review.name}
            </span>
            <TextXsMuted>{review.source}</TextXsMuted>
            <TextSm className="flex" status="warning">
              {Array.from({ length: review.rating }, (_, i) => (
                <FaStar key={`filled-${i}`} />
              ))}
              {Array.from({ length: 5 - review.rating }, (_, i) => (
                <FaRegStar key={`empty-${i}`} />
              ))}
            </TextSm>
          </Stack>
          <TextXsMuted className="mt-1">{review.date}</TextXsMuted>
        </Box>
        <Button
          onClick={onEdit}
          className="rounded-md border border-accent-300 px-2 py-1 text-xs text-accent-600 hover:bg-surface-100 dark:border-accent-600 dark:text-accent-400 dark:hover:bg-surface-700"
        >
          Edit
        </Button>
      </Stack>
      {review.comment && <TextSm className="mt-2">{review.comment}</TextSm>}
    </Box>
  )
}
