import { LocationObject } from '@/lib/types'
import { stringToLocationObject } from '@/lib/slugConfigurations/helpers/parseLocationFromSlug'
import { flattenLocation } from '@/lib/helpers/locationHelpers'

export type EditableFieldName = 'firstName' | 'lastName' | 'email' | 'phone' | 'location'

export const DEFAULT_EDITABLE_FIELDS: EditableFieldName[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'location',
]

export interface EditableEventFields {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: LocationObject
  visibleFields: EditableFieldName[]
}

const FIELD_PATTERN = /<b>(\w[\w\s]*)<\/b>:\s*(.+)/g
const META_PATTERN = /\{"editableFields":\[([^\]]*)\]\}/

export function parseEditableFields(description: string): EditableEventFields {
  const fields: Record<string, string> = {}

  for (const match of description.matchAll(FIELD_PATTERN)) {
    fields[match[1].trim()] = match[2].trim()
  }

  const [firstName = '', ...lastParts] = (fields.Name || '').split(' ')
  const lastName = lastParts.join(' ')

  const metaMatch = description.match(META_PATTERN)
  const visibleFields: EditableFieldName[] = metaMatch
    ? (JSON.parse(`[${metaMatch[1]}]`) as EditableFieldName[])
    : DEFAULT_EDITABLE_FIELDS

  return {
    firstName,
    lastName,
    email: fields.Email || '',
    phone: fields.Phone || '',
    location: stringToLocationObject(fields.Location || ''),
    visibleFields,
  }
}

export function updateDescriptionFields(
  description: string,
  updates: Partial<EditableEventFields>
): string {
  let result = description

  if (updates.firstName !== undefined || updates.lastName !== undefined) {
    const current = parseEditableFields(description)
    const newFirst = updates.firstName ?? current.firstName
    const newLast = updates.lastName ?? current.lastName
    result = result.replace(/(<b>Name<\/b>:\s*).+/, `$1${newFirst} ${newLast}`)
  }

  if (updates.email !== undefined) {
    if (/<b>Email<\/b>/.test(result)) {
      result = result.replace(/(<b>Email<\/b>:\s*).+/, `$1${updates.email}`)
    } else {
      result = result.replace(/(<b>Phone<\/b>)/, `<b>Email</b>: ${updates.email}\n$1`)
    }
  }

  if (updates.phone !== undefined) {
    result = result.replace(/(<b>Phone<\/b>:\s*).+/, `$1${updates.phone}`)
  }

  if (updates.location !== undefined) {
    result = result.replace(/(<b>Location<\/b>:\s*).+/, `$1${flattenLocation(updates.location)}`)
  }

  return result
}
