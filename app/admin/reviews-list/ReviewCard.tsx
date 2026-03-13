import { FaStar, FaRegStar } from 'react-icons/fa'
import { ReviewFormFields, type ReviewFormData } from './ReviewFormFields'

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
      <div className="space-y-3 rounded-lg bg-surface-50 p-4 shadow dark:bg-surface-800">
        <ReviewFormFields form={editForm} onChange={onEditFormChange} variant="edit" />
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:bg-surface-300"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            className="rounded-md border border-accent-300 px-3 py-1.5 text-sm text-accent-700 hover:bg-surface-100 dark:border-accent-600 dark:text-accent-300 dark:hover:bg-surface-700"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-surface-50 p-4 shadow dark:bg-surface-800">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-accent-800 dark:text-accent-200">
              {review.name}
            </span>
            <span className="text-xs text-accent-500 dark:text-accent-400">{review.source}</span>
            <span className="flex text-sm text-yellow-500">
              {Array.from({ length: review.rating }, (_, i) => (
                <FaStar key={`filled-${i}`} />
              ))}
              {Array.from({ length: 5 - review.rating }, (_, i) => (
                <FaRegStar key={`empty-${i}`} />
              ))}
            </span>
          </div>
          <p className="mt-1 text-xs text-accent-500 dark:text-accent-400">{review.date}</p>
        </div>
        <button
          onClick={onEdit}
          className="rounded-md border border-accent-300 px-2 py-1 text-xs text-accent-600 hover:bg-surface-100 dark:border-accent-600 dark:text-accent-400 dark:hover:bg-surface-700"
        >
          Edit
        </button>
      </div>
      {review.comment && (
        <p className="mt-2 text-sm text-accent-700 dark:text-accent-300">{review.comment}</p>
      )}
    </div>
  )
}
