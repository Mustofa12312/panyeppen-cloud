import axios from 'axios'
import { encodeCredentials } from './api'

const BASE_URL = '/nextcloud'

/**
 * Login ke Nextcloud menggunakan Basic Auth
 * Validasi dengan PROPFIND ke WebDAV endpoint user
 */
export async function login(username, password) {
  const token = encodeCredentials(username, password)

  // MOCK LOGIN: Bypassing server connection for UI testing
  console.log("Mocking login for:", username);
  const mockUser = {
    id: username,
    displayName: username === 'admin' ? 'Administrator' : username,
    email: `${username}@example.com`,
    quota: { used: 15485760, total: 10737418240, free: 10721932480, relative: 1.5 },
  }
  sessionStorage.setItem('nc_token', token)
  sessionStorage.setItem('nc_user', JSON.stringify(mockUser))
  return { success: true, user: mockUser }

  /* Original code below (commented out for now):
  try {
    // Test credentials via WebDAV PROPFIND
    const response = await axios.request({
      method: 'PROPFIND',
      url: `${BASE_URL}/remote.php/dav/files/${username}/`,
      headers: {
        Authorization: `Basic ${token}`,
        Depth: '0',
        'Content-Type': 'application/xml',
      },
      data: `<?xml version="1.0" encoding="utf-8"?>
        <D:propfind xmlns:D="DAV:">
          <D:prop>
            <D:displayname/>
          </D:prop>
        </D:propfind>`,
    })

    if (response.status === 207 || response.status === 200) {
      // Ambil info user via OCS API
      const userInfo = await getUserInfo(username, token)

      // Simpan ke sessionStorage (bukan localStorage untuk keamanan)
      sessionStorage.setItem('nc_token', token)
      sessionStorage.setItem('nc_user', JSON.stringify(userInfo))

      return { success: true, user: userInfo }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Username atau password salah')
    }
    if (error.response?.status === 404) {
      throw new Error('User tidak ditemukan')
    }
    throw new Error('Gagal terhubung ke server. Coba lagi.')
  }
  */
}

/**
 * Ambil info user dari OCS API
 */
async function getUserInfo(username, token) {
  try {
    const response = await axios.get(
      `${BASE_URL}/ocs/v1.php/cloud/users/${username}`,
      {
        headers: {
          Authorization: `Basic ${token}`,
          'OCS-APIRequest': 'true',
          Accept: 'application/json',
        },
      }
    )

    const data = response.data?.ocs?.data
    return {
      id: username,
      displayName: data?.displayname || username,
      email: data?.email || '',
      quota: {
        used: data?.quota?.used || 0,
        total: data?.quota?.quota || 0,
        free: data?.quota?.free || 0,
        relative: data?.quota?.relative || 0,
      },
    }
  } catch {
    // Fallback jika OCS API tidak tersedia
    return {
      id: username,
      displayName: username,
      email: '',
      quota: { used: 0, total: 0, free: 0, relative: 0 },
    }
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
 * Refresh info user (quota, dll)
 */
export async function refreshUser() {
  const user = getCurrentUser()
  const token = sessionStorage.getItem('nc_token')
  if (!user || !token) return null

  const updated = await getUserInfo(user.id, token)
  sessionStorage.setItem('nc_user', JSON.stringify(updated))
  return updated
}
