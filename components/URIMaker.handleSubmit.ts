import type { FormEvent, Dispatch, SetStateAction } from 'react'
import { encode } from '@/lib/hashServer'

export async function handleURIMakerSubmit(
  event: FormEvent<HTMLFormElement>,
  setUri: Dispatch<SetStateAction<string>>
) {
  event.preventDefault()
  const jsonData = Object.fromEntries(new FormData(event.currentTarget))
  const uriData = await encode(jsonData)
  const { key: hash } = uriData
  setUri(hash as string)
}
