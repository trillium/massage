const SOURCES = ['Soothe', 'Airbnb', 'Trillium Massage']

export interface ReviewFormData {
  name: string
  rating: number
  date: string
  source: string
  comment: string
  type: string
}

const inputClass =
  'rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
const inputClassDark =
  'rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'

function StarOptions() {
  return (
    <>
      {[5, 4, 3, 2, 1].map((n) => (
        <option key={n} value={n}>
          {'★'.repeat(n)}
          {'☆'.repeat(5 - n)} ({n})
        </option>
      ))}
    </>
  )
}

function SourceOptions() {
  return (
    <>
      {SOURCES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </>
  )
}

export function ReviewFormFields({
  form,
  onChange,
  variant = 'create',
}: {
  form: ReviewFormData
  onChange: (form: ReviewFormData) => void
  variant?: 'create' | 'edit'
}) {
  const cls = variant === 'edit' ? inputClassDark : inputClass

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          className={cls}
        />
        <select
          value={form.rating}
          onChange={(e) => onChange({ ...form, rating: Number(e.target.value) })}
          className={cls}
        >
          <StarOptions />
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => onChange({ ...form, date: e.target.value })}
          className={cls}
        />
        <select
          value={form.source}
          onChange={(e) => onChange({ ...form, source: e.target.value })}
          className={cls}
        >
          <SourceOptions />
        </select>
        <input
          placeholder="Type (e.g. massage, couples)"
          value={form.type}
          onChange={(e) => onChange({ ...form, type: e.target.value })}
          className={cls}
        />
      </div>
      <textarea
        placeholder="Review text..."
        value={form.comment}
        onChange={(e) => onChange({ ...form, comment: e.target.value })}
        rows={3}
        className={`mt-3 w-full ${cls}`}
      />
    </>
  )
}
