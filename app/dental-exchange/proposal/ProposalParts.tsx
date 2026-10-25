/* ds-ignore-file */
import { H2 } from '@/components/ui/heading'
import { TextBase } from '@/components/ui/text'

export function Section({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`mb-10 ${className}`}>{children}</section>
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <H2 className="mb-4 border-b-2 border-primary-600 pb-2 text-2xl font-bold text-primary-700 print:text-xl">
      {children}
    </H2>
  )
}

export function Table({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | React.ReactNode)[][]
}) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={`${i}-${h || 'detail'}`}
              scope="col"
              className="border border-gray-200 bg-primary-50 px-4 py-2 text-left font-semibold text-primary-800"
            >
              {h || (
                <TextBase as="span" className="sr-only">
                  Detail
                </TextBase>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
            {row.map((cell, j) =>
              j === 0 ? (
                <th
                  key={j}
                  scope="row"
                  className="border border-gray-200 px-4 py-2 text-left font-semibold"
                >
                  {cell}
                </th>
              ) : (
                <td key={j} className="border border-gray-200 px-4 py-2">
                  {cell}
                </td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
