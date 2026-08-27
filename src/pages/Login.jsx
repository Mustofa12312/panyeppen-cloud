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
    <div className="animate-slide-up w-full max-w-md mx-auto relative z-10">
      {/* Decorative background blur blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none" />

      {/* Logo */}
      <div className="flex flex-col items-center mb-8 relative">
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] mb-6 transform hover:scale-105 hover:rotate-3 transition-all duration-500">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" opacity="0.9"/>
            <circle cx="12" cy="9" r="3" fill="white"/>
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight mb-2">Panyeppen Cloud</h1>
        <p className="text-[var(--color-muted)] font-medium text-center px-4">Pusat Penyimpanan Digital Terpadu</p>
      </div>

      {/* Form */}
      <div className="card p-8 backdrop-blur-2xl bg-white/70 dark:bg-slate-900/70 border border-white/50 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] rounded-[2.5rem]">
        <p className="text-center text-sm text-[var(--color-muted)] mb-8 font-medium">
          Silakan masuk ke akun Anda
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 mb-6 animate-fade-in">
            <p className="text-sm text-red-600 dark:text-red-400 font-bold text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username */}
          <div className="group">
            <label htmlFor="login-username" className="block text-xs font-bold text-[var(--color-text-light)] mb-2 uppercase tracking-wider group-focus-within:text-teal-600 transition-colors">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="input !h-14 !rounded-2xl bg-white/50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 transition-all border-transparent focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10"
              autoComplete="username"
              autoCapitalize="none"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="group">
            <label htmlFor="login-password" className="block text-xs font-bold text-[var(--color-text-light)] mb-2 uppercase tracking-wider group-focus-within:text-teal-600 transition-colors">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="input !h-14 !rounded-2xl bg-white/50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 transition-all pr-12 border-transparent focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10"
                autoComplete="current-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-[var(--color-muted)] hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all"
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
            className="w-full mt-4 h-14 rounded-2xl text-[15px] font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-1 active:scale-95 shadow-[0_10px_20px_-10px_rgba(20,184,166,0.5)]"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #059669)'
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Memverifikasi...
              </div>
            ) : (
              'Masuk ke Dashboard'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-10 text-center text-sm font-semibold text-[var(--color-muted)]">
        Belum punya akun?{' '}
        <button onClick={() => navigate('/register')} className="text-teal-600 hover:text-teal-700 hover:underline underline-offset-4 transition-all">
          Daftar Sekarang
        </button>
      </p>
      
      <p className="text-center text-xs text-[var(--color-muted)] opacity-70 mt-6 font-medium tracking-wide">
        PANYEPPEN CLOUD © {new Date().getFullYear()}
      </p>
    </div>
  )
}
