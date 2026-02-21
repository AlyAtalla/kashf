const TOKEN_KEY = 'kashf:token'

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (err) {
    // ignore
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (err) {
    return null
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (err) {
    // ignore
  }
}

export function decodeToken(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (err) {
    return null
  }
}

export default { setToken, getToken, clearToken, decodeToken }
