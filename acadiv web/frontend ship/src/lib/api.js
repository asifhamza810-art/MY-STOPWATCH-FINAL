const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const TOKEN_KEY = 'acadiv_access'
const REFRESH_KEY = 'acadiv_refresh'

export function getTokens() {
  return {
    access: localStorage.getItem(TOKEN_KEY),
    refresh: localStorage.getItem(REFRESH_KEY),
  }
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

async function parse(res) {
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.success === false) {
    throw new ApiError(
      body?.error?.message || res.statusText || 'Request failed',
      res.status,
      body?.error?.code,
      body?.error?.details
    )
  }
  return body
}

export async function api(path, { method = 'GET', body, auth = false, formData } = {}) {
  const headers = {}
  if (!formData) headers['Content-Type'] = 'application/json'
  if (auth) {
    const { access } = getTokens()
    if (access) headers.Authorization = `Bearer ${access}`
  }

  let res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData ? formData : body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && auth) {
    const { refresh } = getTokens()
    if (refresh) {
      try {
        const refreshed = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refresh }),
        }).then(parse)
        setTokens(refreshed.data)
        headers.Authorization = `Bearer ${refreshed.data.accessToken}`
        res = await fetch(`${API_BASE}${path}`, {
          method,
          headers,
          body: formData ? formData : body ? JSON.stringify(body) : undefined,
        })
      } catch {
        clearTokens()
      }
    }
  }

  return parse(res)
}

export { API_BASE }
