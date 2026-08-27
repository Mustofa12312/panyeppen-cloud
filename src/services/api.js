import axios from 'axios'

// Base URL ke API kita sendiri
const BASE_URL = '/api'

/**
 * Membuat Axios instance untuk API backend
 */
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
  })

  // Request interceptor — inject Bearer Auth header
  instance.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem('nc_token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
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
