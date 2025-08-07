'use client'

import { formatDate } from 'pliny/utils/formatDate'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import type { Blog } from 'contentlayer/generated'
import clsx from 'clsx'
import Pagination, { PaginationProps } from '@/components/Pagination'
import { CoreContent } from 'pliny/utils/contentlayer'

interface ListLayoutBaseProps {
  readMore?: boolean
  dateToSide?: boolean
  divideY?: boolean
  pagination?: PaginationProps
  posts: CoreContent<Blog>[]
}

export function ListLayoutBase({
  posts,
  pagination,
  readMore = false,
  dateToSide = false,
  divideY = false,
}: ListLayoutBaseProps) {
  return (
    <div className="w-full">
      <ul className={clsx({ 'divide-y divide-gray-200 dark:divide-gray-700': divideY })}>
        {posts.map((post) => {
          const { path, date, title, summary, tags } = post
          return (
            <li key={path} className="py-10">
              <article>
                <div
                  className={clsx({
                    'space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0':
                      dateToSide === true,
                    'pointer mb-1 flex flex-col space-y-2 transition-colors xl:space-y-0':
                      dateToSide === false,
                  })}
                >
                  {dateToSide && (
                    <dl className="hidden xl:block">
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                        <time dateTime={date} suppressHydrationWarning>
                          {formatDate(date, siteMetadata.locale)}
                        </time>
                      </dd>
                    </dl>
                  )}
                  <div className={clsx({ 'space-y-5 xl:col-span-3': dateToSide === true })}>
                    <Link className="group" href={`/${path}`}>
                      <div className="group-hover:border-primary-400 group-hover:bg-primary-100 dark:hover:bg-primary-900 mb-2 rounded-lg border border-transparent p-2">
                        <dl className={clsx({ 'block xl:hidden': dateToSide, block: !dateToSide })}>
                          <dt className="sr-only">Published on</dt>
                          <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                            <time dateTime={date} suppressHydrationWarning>
                              {formatDate(date, siteMetadata.locale)}
                            </time>
                          </dd>
                        </dl>

                        <div>
                          <div>
                            <h2 className="text-2xl leading-8 font-bold tracking-tight">
                              <p className="text-gray-900 dark:text-gray-100">{title}</p>
                            </h2>
                          </div>
                          <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                            {summary}
                          </div>
                          {readMore && (
                            <div className="text-primary-500 group-hover:text-primary-300 leading-6 font-medium">
                              Read more &rarr;
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="flex flex-row flex-wrap gap-1">
                      {tags?.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
      {pagination && pagination.totalPages > 1 && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </div>
  )
}

export default ListLayoutBase
