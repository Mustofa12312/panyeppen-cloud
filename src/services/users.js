import axios from 'axios'

const BASE_URL = '/nextcloud'

function getAuthHeader() {
  const token = sessionStorage.getItem('nc_token')
  return token ? `Basic ${token}` : ''
}

/**
 * Mendapatkan info quota/storage user
 */
export async function getStorageInfo() {
  const raw = sessionStorage.getItem('nc_user')
  if (!raw) return null

  try {
    const user = JSON.parse(raw)
    const response = await axios.get(
      `${BASE_URL}/ocs/v1.php/cloud/users/${user.id}`,
      {
        headers: {
          Authorization: getAuthHeader(),
          'OCS-APIRequest': 'true',
          Accept: 'application/json',
        },
      }
    )

    const data = response.data?.ocs?.data
    return {
      used: data?.quota?.used || 0,
      total: data?.quota?.quota || 0,
      free: data?.quota?.free || 0,
      relative: data?.quota?.relative || 0,
    }
  } catch {
    // Return dari cache
    const user = JSON.parse(raw)
    return user.quota || { used: 0, total: 0, free: 0, relative: 0 }
  }
}

/**
 * Mendapatkan info user saat ini
 */
export async function getUserInfo() {
  const raw = sessionStorage.getItem('nc_user')
  if (!raw) return null

  try {
    const user = JSON.parse(raw)
    const response = await axios.get(
      `${BASE_URL}/ocs/v1.php/cloud/users/${user.id}`,
      {
        headers: {
          Authorization: getAuthHeader(),
          'OCS-APIRequest': 'true',
          Accept: 'application/json',
        },
      }
    )

    const data = response.data?.ocs?.data
    const updated = {
      id: user.id,
      displayName: data?.displayname || user.displayName,
      email: data?.email || user.email || '',
      quota: {
        used: data?.quota?.used || 0,
        total: data?.quota?.quota || 0,
        free: data?.quota?.free || 0,
        relative: data?.quota?.relative || 0,
      },
    }

    sessionStorage.setItem('nc_user', JSON.stringify(updated))
    return updated
  } catch {
    return JSON.parse(raw)
  }
}
