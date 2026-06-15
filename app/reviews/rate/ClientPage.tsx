'use client'
import { useAppDispatch, useReduxReviewFormData } from '@/redux/hooks'
import ReviewForm from 'components/ReviewForm'
import { setReviewForm } from '@/redux/slices/reviewFormSlice'
import { useEffect } from 'react'
import { Stack } from '@/components/ui/stack'

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
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setReviewForm({ firstName, lastName }))
  }, [dispatch, firstName, lastName])

  return (
    <Stack direction="col" align="center">
      <ReviewForm
        error={error ?? ''} // Provide a default value for error
        start={start}
        end={end}
      />
    </Stack>
  )
}
