import { useAuthContext } from '../context/AuthContext'

/**
 * Hook untuk mengakses auth state dan actions
 */
export function useAuth() {
  return useAuthContext()
}
