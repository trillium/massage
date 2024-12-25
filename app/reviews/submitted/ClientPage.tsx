"use client"
import { useReduxFormData } from "@/app/hooks"

import Template from "@/components/Template"
import { ReviewSnippet } from "@/components/ReviewCard"
import BookSessionButton from "@/components/BookSessionButton"

export default function About(props: any) {
  const { firstName, lastName, text, rating } = useReduxFormData()

  return (
    <div className="flex h-full flex-col items-center justify-between">
      <Template title="Thanks! Your review has been received!" />
      <div
        className={
          "w-full max-w-lg bg-slate-100 dark:bg-slate-900 rounded-xl border-2 border-primary-400 " +
          "p-8 xl:mt-0 mt-8 xl:ml-8 ml-0 " +
          ""
        }>
        <div className="p-4 w-full">
          <ReviewSnippet
            text={text}
            name={
              (!firstName && !lastName
                ? "Anonymous"
                : !lastName
                ? firstName
                : firstName + " " + lastName[0] + ".") || "Anonymous"
            }
            rating={rating}
          />
        </div>
      </div>
      {rating && rating > 3 && (
        <div className="pt-8">
          <BookSessionButton title="Book a Session!" href="/" />
        </div>
      )}
    </div>
  )
}
