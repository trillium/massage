interface Attendee {
  email?: string
  displayName: string
  responseStatus: string
  organizer?: boolean
}

export default function AttendeeList({ attendees }: { attendees: Attendee[] }) {
  return (
    <div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Attendees</h3>
      <div className="space-y-2">
        {attendees.map((attendee, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded bg-gray-100 p-3 dark:bg-gray-700"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {attendee.displayName}
                {attendee.organizer && (
                  <span className="ml-2 rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Organizer
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{attendee.email}</p>
            </div>
            <span
              className={`rounded px-2 py-1 text-xs font-medium ${
                attendee.responseStatus === 'accepted'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {attendee.responseStatus}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
