const REFRESH_TOKEN_KEY = 'refreshToken'

let accessToken: string | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

/** Access token en memoria; refresh token en localStorage para sobrevivir recargas. */
export const tokens = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set(pair: { accessToken: string; refreshToken: string }) {
    accessToken = pair.accessToken
    localStorage.setItem(REFRESH_TOKEN_KEY, pair.refreshToken)
    emit()
  },
  clear() {
    accessToken = null
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    emit()
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
