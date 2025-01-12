import { format } from 'date-fns'

export function formatDatetimeToString(datetimeObj: Date) {
  return format(datetimeObj, "yyyy-MM-dd'T'HH:mm:ssXXX")
}
