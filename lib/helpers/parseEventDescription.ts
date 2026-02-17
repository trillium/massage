export interface EditableEventFields {
  firstName: string
  lastName: string
  phone: string
  location: string
}

const FIELD_PATTERN = /<b>(\w[\w\s]*)<\/b>:\s*(.+)/g

export function parseEditableFields(description: string): EditableEventFields {
  const fields: Record<string, string> = {}

  for (const match of description.matchAll(FIELD_PATTERN)) {
    fields[match[1].trim()] = match[2].trim()
  }

  const [firstName = '', ...lastParts] = (fields['Name'] || '').split(' ')
  const lastName = lastParts.join(' ')

  return {
    firstName,
    lastName,
    phone: fields['Phone'] || '',
    location: fields['Location'] || '',
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

  if (updates.phone !== undefined) {
    result = result.replace(/(<b>Phone<\/b>:\s*).+/, `$1${updates.phone}`)
  }

  if (updates.location !== undefined) {
    result = result.replace(/(<b>Location<\/b>:\s*).+/, `$1${updates.location}`)
  }

  return result
}
