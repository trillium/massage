import { useEffect } from "react"

import type { DateTimeInterval } from "@/lib/types"
import { useAppDispatch } from "@/app/hooks"
import { setReady } from "@/redux/slices/readySlice"
import { TimeSkeleton } from "./TimeSkeleton"

type TimeListProps = {
  availability: DateTimeInterval[]
}
export default function TimeList() {
  
  const dispatchRedux = useAppDispatch()
  useEffect(() => {
    dispatchRedux(setReady({ TimeList: true }))
    // eslint-disable-next-line
  }, [])

  return (
    <div className="grid grid-cols-2 gap-2">
      <TimeSkeleton />
      <TimeSkeleton />
      <TimeSkeleton />
      <TimeSkeleton />
      <TimeSkeleton />
      <TimeSkeleton />
      <TimeSkeleton />
      <TimeSkeleton />
      <TimeSkeleton />
      <TimeSkeleton />
      <TimeSkeleton />
      <TimeSkeleton />
    </div>
  )
}
