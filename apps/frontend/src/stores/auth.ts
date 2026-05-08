import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'auth.token'
const USER_KEY = 'auth.user'
const LAST_ACTIVITY_KEY = 'auth.lastActivity'

// Logout after 30 minutes of inactivity
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']

const savedUser = sessionStorage.getItem(USER_KEY)
let parsedUser: any = null

try {
  parsedUser = savedUser ? JSON.parse(savedUser) : null
} catch {
  sessionStorage.removeItem(USER_KEY)
}

export function isSessionExpired(): boolean {
  const last = sessionStorage.getItem(LAST_ACTIVITY_KEY)
  if (!last) return false
  return Date.now() - Number(last) > INACTIVITY_TIMEOUT_MS
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(sessionStorage.getItem(TOKEN_KEY))
  const user = ref<any>(parsedUser)

  const isAuthenticated = computed(() => !!token.value)

  let inactivityTimer: ReturnType<typeof setTimeout> | null = null

  const logout = () => {
    token.value = null
    user.value = null
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(LAST_ACTIVITY_KEY)
    stopInactivityTimer()
    window.location.href = '/login'
  }

  function recordActivity() {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
    resetInactivityTimer()
  }

  function stopInactivityTimer() {
    if (inactivityTimer !== null) {
      clearTimeout(inactivityTimer)
      inactivityTimer = null
    }
    ACTIVITY_EVENTS.forEach((event) =>
      window.removeEventListener(event, recordActivity)
    )
  }

  function resetInactivityTimer() {
    if (inactivityTimer !== null) clearTimeout(inactivityTimer)
    inactivityTimer = setTimeout(() => {
      logout()
      window.location.href = '/login?reason=inactivity'
    }, INACTIVITY_TIMEOUT_MS)
  }

  function startInactivityTimer() {
    stopInactivityTimer()
    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, recordActivity, { passive: true })
    )
    resetInactivityTimer()
  }

  // Resume timer if already authenticated (page reload)
  if (token.value) {
    if (isSessionExpired()) {
      logout()
    } else {
      startInactivityTimer()
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      token.value = data.token
      user.value = data.user
      sessionStorage.setItem(TOKEN_KEY, data.token)
      sessionStorage.setItem(USER_KEY, JSON.stringify(data.user))
      startInactivityTimer()

      return data
    } catch (error) {
      throw error
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  }
})