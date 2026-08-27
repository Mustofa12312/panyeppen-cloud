import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/auth'

export default function Register() {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Kata sandi tidak cocok')
      return
    }

    setLoading(true)
    
    try {
      await register(username, password, displayName)
      // Navigate to login after successful registration
      navigate('/login', { state: { message: 'Registrasi berhasil! Silakan login.' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md w-full glass p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-[var(--color-glass-border)] animate-slide-up relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-emerald-400/20 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
      
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 mb-6 border border-white/20 transform hover:scale-105 transition-transform duration-300">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" opacity="0.9"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight mb-2">Daftar Akun</h2>
        <p className="text-sm text-[var(--color-text-light)] font-medium">Buat akun Panyeppen Cloud Anda</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl font-medium shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-light)] uppercase tracking-wider mb-2 ml-1">
            Nama Tampilan
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input font-medium"
            placeholder="Misal: Budi Santoso"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-light)] uppercase tracking-wider mb-2 ml-1">
            Username
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input font-medium"
            placeholder="Misal: budisantoso"
            autoCapitalize="none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-light)] uppercase tracking-wider mb-2 ml-1">
            Kata Sandi
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input font-medium"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-light)] uppercase tracking-wider mb-2 ml-1">
            Konfirmasi Kata Sandi
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input font-medium"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3.5 px-4 mt-6 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] hover:from-[var(--color-primary-400)] hover:to-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Buat Akun'
          )}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm font-medium text-[var(--color-text-light)]">
        Sudah punya akun?{' '}
        <Link to="/login" className="font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] hover:underline transition-all">
          Masuk di sini
        </Link>
      </p>
    </div>
  )
}
