import fetch from 'node-fetch'

type PushoverOptions = {
  message: string
  title?: string
  url?: string
  url_title?: string
  priority?: number
  sound?: string
  device?: string
}

/**
 * Send a push notification using the Pushover API.
 * @param user - string (optional)
 * @param message - string
 * @param title - string (optional)
 * @param url - string (optional)
 * @param url_title - string (optional)
 * @param priority - number (optional)
 * @param sound - string (optional)
 * @param device - string (optional)
 * @returns Promise<boolean> - true if sent successfully, false otherwise
 */
export async function pushoverSendMessage({
  message,
  title,
  url,
  url_title,
  priority,
  sound,
  device,
}: PushoverOptions): Promise<boolean> {
  const endpoint = 'https://api.pushover.net/1/messages.json'
  const params = new URLSearchParams()
  const token = process.env.PUSHOVER_API_KEY
  const userKey = process.env.PUSHOVER_USER_KEY
  if (!token) throw new Error('PUSHOVER_API_KEY is not set in environment variables')
  if (!userKey) throw new Error('PUSHOVER_USER_KEY is not set in environment variables')
  params.append('user', userKey)
  params.append('token', token)
  params.append('message', message)
  if (title) params.append('title', title)
  if (url) params.append('url', url)
  if (url_title) params.append('url_title', url_title)
  if (priority !== undefined) params.append('priority', String(priority))
  if (sound) params.append('sound', sound)
  if (device) params.append('device', device)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: params,
    })
    return res.ok
  } catch (e) {
    return false
  }
}
