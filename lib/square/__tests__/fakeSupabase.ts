/** Minimal in-memory Supabase fake: just enough query-builder for the invoice/webhook code. */
type Row = Record<string, unknown>
type Result = { data: unknown; error: { code?: string; message: string } | null }

export function createFakeSupabase(
  seed: Record<string, Row[]> = {},
  opts: { uniqueKeys?: Record<string, string>; failUpdates?: string[] } = {}
) {
  const tables: Record<string, Row[]> = seed
  const unique = {
    square_webhook_events: 'event_id',
    invoice_audit_log: 'idempotency_key',
    ...opts.uniqueKeys,
  }

  function from(table: string) {
    tables[table] ??= []
    let op: 'select' | 'insert' | 'update' = 'select'
    let payload: Row = {}
    const filters: Array<(r: Row) => boolean> = []
    let wantRows = false

    const run = (): Result => {
      const rows = tables[table]
      if (op === 'insert') {
        const key = unique[table as keyof typeof unique]
        if (key && payload[key] != null && rows.some((r) => r[key] === payload[key])) {
          return { data: null, error: { code: '23505', message: 'duplicate key' } }
        }
        rows.push({ ...payload })
        return { data: null, error: null }
      }
      const matched = rows.filter((r) => filters.every((f) => f(r)))
      if (op === 'update') {
        if (opts.failUpdates?.includes(table)) {
          return { data: null, error: { message: 'update boom' } }
        }
        for (const r of matched) Object.assign(r, payload)
        return { data: wantRows ? matched : null, error: null }
      }
      return { data: matched, error: null }
    }

    const b: Record<string, unknown> = {
      insert(p: Row) {
        op = 'insert'
        payload = p
        return b
      },
      update(p: Row) {
        op = 'update'
        payload = p
        return b
      },
      select() {
        wantRows = true
        return b
      },
      eq(col: string, val: unknown) {
        filters.push((r) => r[col] === val)
        return b
      },
      or(expr: string) {
        const parts = expr.split(',')
        filters.push((r) =>
          parts.some((p) => {
            const [col, o, ...rest] = p.split('.')
            const v = rest.join('.')
            if (o === 'is' && v === 'null') return r[col] == null
            if (o === 'lt') return r[col] != null && Number(r[col]) < Number(v)
            return false
          })
        )
        return b
      },
      order: () => b,
      limit: () => b,
      maybeSingle() {
        const res = run()
        const first = Array.isArray(res.data) ? (res.data[0] ?? null) : res.data
        return Promise.resolve({ ...res, data: first })
      },
      // biome-ignore lint/suspicious/noThenProperty: the fake must be awaitable like a Supabase builder
      then(resolve: (r: Result) => unknown, reject?: (e: unknown) => unknown) {
        return Promise.resolve(run()).then(resolve, reject)
      },
    }
    return b
  }

  return { client: { from }, tables }
}
