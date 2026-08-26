import { BellIcon, UserCircleIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Header({ title, showBack = false, onBack }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.body.classList.add('dark')
      setIsDark(true)
    }
  }, [])

  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.body.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleBack = () => {
    if (onBack) return onBack()
    navigate(-1)
  }

  return (
    <header className="sticky top-0 z-40 glass border-b border-[var(--color-glass-border)]">
      <div className="flex items-center justify-between px-4 md:px-8 h-14 md:h-16 w-full max-w-[1600px] mx-auto">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/80 transition-all active:scale-95 border border-transparent hover:border-[var(--color-glass-border)] hover:shadow-sm"
              aria-label="Kembali"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-2.5 md:hidden group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform border border-white/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" opacity="0.9"/>
                  <circle cx="12" cy="9" r="2.5" fill="white"/>
                </svg>
              </div>
              <span className="font-extrabold text-[0.9375rem] text-[var(--color-text)] tracking-tight">
                Panyeppen Cloud
              </span>
            </Link>
          )}
          {title && (
            <h1 className="font-bold text-[1rem] text-[var(--color-text)] tracking-wide truncate max-w-[180px]">
              {title}
            </h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={toggleDark}
            className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/80 transition-all border border-transparent hover:border-[var(--color-glass-border)] hover:shadow-sm"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <SunIcon className="w-5 h-5 text-[var(--color-text-light)]" />
            ) : (
              <MoonIcon className="w-5 h-5 text-[var(--color-text-light)]" />
            )}
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/80 transition-all relative border border-transparent hover:border-[var(--color-glass-border)] hover:shadow-sm"
            aria-label="Notifikasi"
          >
            <BellIcon className="w-5 h-5 text-[var(--color-text-light)]" />
            {/* Badge notifikasi */}
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[var(--color-danger)] shadow-[0_0_0_2px_var(--color-surface)]" />
          </button>
          <Link
            to="/profile"
            className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/80 transition-all border border-transparent hover:border-[var(--color-glass-border)] hover:shadow-sm"
            aria-label="Profil"
          >
            {user?.displayName ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center shadow-inner border border-white/20">
                <span className="text-white text-xs font-bold">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            ) : (
              <UserCircleIcon className="w-6 h-6 text-[var(--color-text-light)]" />
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
