'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { adminFetch } from '@/lib/adminFetch'
import { ReviewFormFields, type ReviewFormData } from './ReviewFormFields'
import { ReviewCard } from './ReviewCard'

interface Review {
  id: number
  name: string
  rating: number
  date: string
  source: string
  comment?: string
  type?: string
}

const emptyForm: ReviewFormData = {
  name: '',
  rating: 5,
  date: new Date().toISOString().split('T')[0],
  source: 'Soothe',
  comment: '',
  type: '',
}

async function saveReview(method: string, body: Record<string, unknown>) {
  const res = await adminFetch('/api/admin/reviews', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data.review
}

function formToPayload(form: ReviewFormData) {
  return {
    ...form,
    rating: Number(form.rating),
    comment: form.comment || undefined,
    type: form.type || undefined,
  }
}

export function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)

  const sources = [...new Set(reviews.map((r) => r.source))].sort()
  const filtered = sourceFilter ? reviews.filter((r) => r.source === sourceFilter) : reviews

  const latestBySource = sources.reduce<Record<string, Review>>((acc, source) => {
    const sourceReviews = reviews.filter((r) => r.source === source)
    acc[source] = sourceReviews.reduce((a, b) => (new Date(a.date) > new Date(b.date) ? a : b))
    return acc
  }, {})

  const handleCreate = async () => {
    setSaving(true)
    try {
      const review = await saveReview('POST', formToPayload(form))
      setReviews((prev) => [review, ...prev])
      setForm(emptyForm)
      toast.success('Review added')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add review')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: number) => {
    setSaving(true)
    try {
      const review = await saveReview('PATCH', { id, ...formToPayload(editForm) })
      setReviews((prev) => prev.map((r) => (r.id === id ? review : r)))
      setEditingId(null)
      toast.success('Review updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update review')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (review: Review) => {
    setEditingId(review.id)
    setEditForm({
      name: review.name,
      rating: review.rating,
      date: review.date,
      source: review.source,
      comment: review.comment || '',
      type: review.type || '',
    })
  }

  return (
    <div className="space-y-8">
      <SourceFilterBar
        sources={sources}
        latestBySource={latestBySource}
        sourceFilter={sourceFilter}
        onFilterChange={setSourceFilter}
      />

      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <h2 className="mb-3 text-sm font-medium text-green-800 dark:text-green-200">Add Review</h2>
        <ReviewFormFields form={form} onChange={setForm} />
        <button
          onClick={handleCreate}
          disabled={saving || !form.name || !form.date}
          className="mt-3 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-300"
        >
          {saving ? 'Saving...' : 'Add Review'}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {sourceFilter ? `${sourceFilter} Reviews` : 'All Reviews'} ({filtered.length})
        </h2>
        {filtered.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            editing={editingId === review.id}
            editForm={editForm}
            saving={saving}
            onEdit={() => startEdit(review)}
            onSave={() => handleUpdate(review.id)}
            onCancel={() => setEditingId(null)}
            onEditFormChange={setEditForm}
          />
        ))}
      </div>
    </div>
  )
}

function SourceFilterBar({
  sources,
  latestBySource,
  sourceFilter,
  onFilterChange,
}: {
  sources: string[]
  latestBySource: Record<string, Review>
  sourceFilter: string | null
  onFilterChange: (source: string | null) => void
}) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <h2 className="mb-3 text-sm font-medium text-blue-800 dark:text-blue-200">
        Most Recent by Source
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => {
          const r = latestBySource[source]
          return (
            <button
              key={source}
              onClick={() => onFilterChange(sourceFilter === source ? null : source)}
              className={`rounded-md border p-2 text-left text-sm transition-colors ${
                sourceFilter === source
                  ? 'border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-800/40'
                  : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">{source}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {r.date} — {r.name}
              </div>
            </button>
          )
        })}
      </div>
      {sourceFilter && (
        <button
          onClick={() => onFilterChange(null)}
          className="mt-2 text-xs text-blue-600 hover:underline dark:text-blue-400"
        >
          Clear filter
        </button>
      )}
    </div>
  )
}
