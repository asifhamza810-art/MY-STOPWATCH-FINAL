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
    this.name = 'ApiError'
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

// Single-flight refresh state to prevent concurrent 401 race conditions
let refreshPromise = null

async function requestRefreshToken() {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const { refresh } = getTokens()
    if (!refresh) {
      clearTokens()
      throw new ApiError('No refresh token available', 401, 'UNAUTHORIZED')
    }

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      })
      const data = await parse(res)
      setTokens(data.data)
      return data.data.accessToken
    } catch (err) {
      clearTokens()
      throw err
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function api(path, { method = 'GET', body, auth = false, formData, timeout = 15000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  const prepareHeaders = (token) => {
    const headers = {}
    if (!formData) headers['Content-Type'] = 'application/json'
    if (auth && token) headers.Authorization = `Bearer ${token}`
    return headers
  }

  const send = (token) => {
    return fetch(`${API_BASE}${path}`, {
      method,
      headers: prepareHeaders(token),
      body: formData ? formData : body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  }

  try {
    const { access } = getTokens()
    let res = await send(access)

    // Handle 401 with single-flight refresh and single replay
    if (res.status === 401 && auth) {
      try {
        const newAccessToken = await requestRefreshToken()
        res = await send(newAccessToken)
      } catch (refreshErr) {
        // Return or rethrow original error
        return parse(res)
      }
    }

    return parse(res)
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your network connection.', 408, 'TIMEOUT')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export { API_BASE }
