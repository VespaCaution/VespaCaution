// shared/auth.js
const AuthAPI = (() => {
  const SUPABASE_URL = 'https://wiptxvsjhvwilnonpgrc.supabase.co'
  const SUPABASE_ANON_KEY = 'sb_publishable_kMN7nJ6QPdqe5JTIExWeRA_SxPMK0L8'
  const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/auth`

  let token = null
  let siteId = null

  function init(config) {
    siteId = config.siteId
    token = localStorage.getItem(`auth_token_${siteId}`)
  }

  async function call(payload, withAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    }
    if (withAuth && token) headers.Authorization = `Bearer ${token}`

    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...payload, siteId }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  async function register(email, password) {
    const { session } = await call({ action: 'register', email, password })
    if (session) setToken(session.access_token)
  }

  async function login(email, password) {
    const { session } = await call({ action: 'login', email, password })
    if (session) setToken(session.access_token)
  }

  function logout() {
    token = null
    localStorage.removeItem(`auth_token_${siteId}`)
  }

  function setToken(t) {
    token = t
    localStorage.setItem(`auth_token_${siteId}`, t)
  }

  function isLoggedIn() {
    return !!token
  }

  async function syncSave(data) {
    return call({ action: 'sync-save', data }, true)
  }

  async function syncLoad() {
    const { data } = await call({ action: 'sync-load' }, true)
    return data
  }

  return { init, register, login, logout, isLoggedIn, syncSave, syncLoad, get token() { return token } }
})()
