"use client"

import type { InferGetServerSidePropsType } from "next"
import { useCallback, useEffect } from "react"
import format from "date-fns-tz/format"

import { PickerProps } from "@/components/availability/AvailabilityPicker"
import {
  DEFAULT_APPOINTMENT_INTERVAL,
  DEFAULT_PRICING,
  OWNER_AVAILABILITY,
  ALLOWED_DURATIONS,
  VALID_DURATIONS,
  LEAD_TIME
} from "@/config"
import getAvailability from "@/lib/availability/getAvailability"
import getPotentialTimes from "@/lib/availability/getPotentialTimes"
import { mapStringsToDates } from "@/lib/availability/helpers"
import Day from "@/lib/day"

import PageProps from "@/app/page"
import { setDuration, setSelectedDate } from "@/redux/slices/availabilitySlice"
import { useAppDispatch, useReduxAvailability } from "@/app/hooks"
import { DateTimeIntervalAndLocation } from "@/lib/types"
import { setEventContainers } from "@/redux/slices/eventContainersSlice"

type PricingWrapperProps = InferGetServerSidePropsType<typeof PageProps> & {
  containers: DateTimeIntervalAndLocation
  acceptingPayment: boolean
}

export function PricingWrapper({
  start,
  end,
  busy,
  selectedDate,
  duration,
  containers,
  eventMemberString,
  eventBaseString,
  allowedDurations,
  leadTime = LEAD_TIME,
  pricing = DEFAULT_PRICING,
  acceptingPayment
}: PricingWrapperProps) {
  const dispatchRedux = useAppDispatch()
  const {
    duration: durationRedux,
    timeZone,
    selectedDate: selectedDateRedux,
  } = useReduxAvailability()

  const pickerProps: PickerProps = {
    durationProps: {
      title: `${durationRedux || duration || "##"} minute session${acceptingPayment ? (" - $" +
        pricing[durationRedux || duration]) : ""
        }`,
      allowedDurations: allowedDurations || ALLOWED_DURATIONS,
    },
    tzPickerProps: {
      showPicker: false,
    },
  }

  const startDay = Day.dayFromString(start)
  const endDay = Day.dayFromString(end)

  const potential = getPotentialTimes({
    start: startDay,
    end: endDay,
    duration: durationRedux || duration,
    availabilitySlots: OWNER_AVAILABILITY,
    containers: containers,
  })

  const offers = getAvailability({
    busy: mapStringsToDates(busy),
    potential,
    leadTime
  })

  const slots = offers.filter((slot) => {
    return (
      slot.start >= startDay.toInterval("Etc/GMT").start &&
      slot.end <= endDay.toInterval("Etc/GMT").end
    )
  })

  const initialURLParamsData = useCallback(() => {
    if (selectedDate) {
      dispatchRedux(setSelectedDate(selectedDate))
    } else {
      if (slots.length > 0) {
        const firstAvail = format(slots[0].start, "yyyy-MM-dd", { timeZone })
        dispatchRedux(setSelectedDate(firstAvail))
      }
    }
    const newDuration = duration || allowedDurations
    const ALLOWED = allowedDurations || ALLOWED_DURATIONS
    if (!ALLOWED.includes(newDuration)) {
      const middleIndex = Math.floor((ALLOWED.length - 1) / 2)
      const biasedIndex =
        ALLOWED.length % 2 === 0 ? middleIndex + 1 : middleIndex
      const adjustedDuration = ALLOWED[biasedIndex]
      dispatchRedux(setDuration(adjustedDuration))
    } else {
      dispatchRedux(setDuration(newDuration))
    }
    if (eventMemberString) {
      dispatchRedux(
        setEventContainers({ eventMemberString: eventMemberString || "" })
      )
    }
    if (eventBaseString) {
      dispatchRedux(
        setEventContainers({ eventBaseString: eventBaseString || "" })
      )
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    initialURLParamsData()
  }, [initialURLParamsData])

  type UrlParams = {
    duration?: string
    selectedDate?: string
    timeZone?: string
  }

  const createNewUrlParams = useCallback(() => {
    const newParamsObj: UrlParams = {}
    if (durationRedux) newParamsObj.duration = durationRedux.toString()
    if (selectedDateRedux) newParamsObj.selectedDate = selectedDateRedux
    if (timeZone != "America/Los_Angeles") newParamsObj.timeZone = timeZone
    const newUrl = new URLSearchParams({ ...newParamsObj })
    // Push to the window.
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${newUrl.toString()}`
    )
  }, [durationRedux, selectedDateRedux, timeZone])

  useEffect(() => {
    createNewUrlParams()
  }, [createNewUrlParams])

  return { slots, pickerProps }
}
