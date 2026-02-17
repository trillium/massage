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
      <div className="space-y-3 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <ReviewFormFields form={editForm} onChange={onEditFormChange} variant="edit" />
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:bg-gray-300"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{review.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{review.source}</span>
            <span className="text-sm text-yellow-500">
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
        </div>
        <button
          onClick={onEdit}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Edit
        </button>
      </div>
      {review.comment && (
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>
      )}
    </div>
  )
}
