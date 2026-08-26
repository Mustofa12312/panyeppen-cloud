import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) return

    setLoading(true)
    setError('')

    try {
      await login(username.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Login gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-slide-up">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center shadow-xl shadow-green-200 mb-5">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" opacity="0.85"/>
            <circle cx="12" cy="9" r="3" fill="white"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">Panyeppen Cloud</h1>
        <p className="text-sm text-[#64748b] mt-1">Penyimpanan Dokumen Pesantren</p>
      </div>

      {/* Form */}
      <div className="card p-6">
        <p className="text-center text-sm text-[#64748b] mb-6 font-medium">
          Assalamu'alaikum, silakan masuk
        </p>

        {error && (
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3.5 mb-5 animate-fade-in">
            <p className="text-sm text-[#dc2626] font-medium text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <label htmlFor="login-username" className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="input"
              autoComplete="username"
              autoCapitalize="none"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="input pr-11"
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b] transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading || !username || !password}
            className="btn btn-primary w-full mt-2 text-base font-bold shadow-md shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin-slow" />
                Masuk...
              </div>
            ) : (
              'Masuk'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-[#94a3b8] mt-8">
        Panyeppen Cloud © 2026
      </p>
    </div>
  )
}
