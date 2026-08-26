import axios from 'axios'

// Base URL ke Nextcloud via Vite proxy
const BASE_URL = '/nextcloud'

/**
 * Membuat Axios instance untuk Nextcloud WebDAV
 */
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
  })

  // Request interceptor — inject Basic Auth header
  instance.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem('nc_token')
      if (token) {
        config.headers['Authorization'] = `Basic ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Response interceptor — handle error global
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Session expired — hapus token dan redirect ke login
        sessionStorage.removeItem('nc_token')
        sessionStorage.removeItem('nc_user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return instance
}

export const api = createApiInstance()

/**
 * Helper: encode credentials ke Base64 untuk Basic Auth
 */
export function encodeCredentials(username, password) {
  return btoa(`${username}:${password}`)
}

/**
 * Helper: parse XML WebDAV response
 */
export function parseWebDAVResponse(xmlString) {
  const parser = new DOMParser()
  return parser.parseFromString(xmlString, 'application/xml')
}

/**
 * Helper: extract value dari element WebDAV
 */
export function getXmlValue(doc, tagName, ns = '') {
  const el = doc.querySelector(tagName) || doc.getElementsByTagNameNS('*', tagName.split(':').pop())[0]
  return el?.textContent?.trim() || ''
}
