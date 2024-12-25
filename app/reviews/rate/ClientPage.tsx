"use client"
import { useAppDispatch, useReduxFormData } from "@/app/hooks"
import ReviewForm from "@/components/ReviewForm"
import { setForm } from "@/redux/slices/formSlice"
import { useEffect } from "react"

type PageProps = {
  date: string
  error?: string
  start: string
  end: string
  firstName: string
  lastName: string
}

export default function ClientPage(props: PageProps) {
  const { date, error, start, end, firstName, lastName } = props
  const dispatchRedux = useAppDispatch()
  const formData = useReduxFormData()
  const newFormData = {
    ...formData,
    firstName: firstName,
    lastName: lastName,
  }

  useEffect(() => {
    dispatchRedux(setForm(newFormData))
    // eslint-disable-next-line
  }, [])

  return (
    <div className="flex flex-col items-center">
      <ReviewForm
        error={error ?? ""} // Provide a default value for error
        start={start}
        end={end}
      />
    </div>
  )
}
