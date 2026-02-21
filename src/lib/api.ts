import auth from './auth'

export const apiBase = import.meta.env.VITE_API_BASE || ''

async function handleResponse(res: Response) {
  const text = await res.text()
  try {
    const json = text ? JSON.parse(text) : null
    if (!res.ok) throw new Error(json?.error || res.statusText)
    return json
  } catch (err) {
    if (!res.ok) throw new Error(res.statusText)
    return null
  }
}

function buildHeaders(hasBody = false) {
  const headers: Record<string, string> = {}
  if (hasBody) headers['Content-Type'] = 'application/json'
  const token = auth.getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function post(path: string, body: any) {
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(body)
  })
  return handleResponse(res)
}

export async function get(path: string) {
  const res = await fetch(`${apiBase}${path}`, {
    method: 'GET',
    headers: buildHeaders(false)
  })
  return handleResponse(res)
}

export default { post, get }
