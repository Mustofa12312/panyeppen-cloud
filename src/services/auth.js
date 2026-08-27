import { api } from './api'

/**
 * Login ke backend
 */
export async function login(username, password) {
  try {
    const response = await api.post('/auth/login', { username, password })
    const { token, user } = response.data

    sessionStorage.setItem('nc_token', token)
    sessionStorage.setItem('nc_user', JSON.stringify(user))
    
    return { success: true, user }
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error('Gagal terhubung ke server. Coba lagi.')
  }
}

/**
 * Register akun baru
 */
export async function register(username, password, displayName) {
  try {
    const response = await api.post('/auth/register', { username, password, displayName })
    return response.data
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error('Gagal terhubung ke server. Coba lagi.')
  }
}

/**
 * Logout — hapus session
 */
export function logout() {
  sessionStorage.removeItem('nc_token')
  sessionStorage.removeItem('nc_user')
}

/**
 * Mendapatkan user yang sedang login dari sessionStorage
 */
export function getCurrentUser() {
  const raw = sessionStorage.getItem('nc_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Cek apakah user sudah login
 */
export function isAuthenticated() {
  return !!sessionStorage.getItem('nc_token')
}

/**
 * Refresh info user
 */
export async function refreshUser() {
  const user = getCurrentUser()
  const token = sessionStorage.getItem('nc_token')
  if (!user || !token) return null

  try {
    const response = await api.get('/auth/me')
    const updatedUser = response.data
    sessionStorage.setItem('nc_user', JSON.stringify(updatedUser))
    return updatedUser
  } catch (error) {
    return null
  }
}
