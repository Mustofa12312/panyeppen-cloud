import { NavLink, Link } from 'react-router-dom'
import {
  HomeIcon,
  FolderIcon,
  ShareIcon,
  UserIcon,
  CloudArrowUpIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  FolderIcon as FolderIconSolid,
  ShareIcon as ShareIconSolid,
  UserIcon as UserIconSolid,
  TrashIcon as TrashIconSolid,
} from '@heroicons/react/24/solid'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { useAuth } from '../hooks/useAuth'
import StorageCard from './StorageCard'

const navItems = [
  { to: '/', label: 'Dashboard', Icon: HomeIcon, IconActive: HomeIconSolid, end: true },
  { to: '/files', label: 'Semua File', Icon: FolderIcon, IconActive: FolderIconSolid },
  { to: '/shared', label: 'Dibagikan', Icon: ShareIcon, IconActive: ShareIconSolid },
  { to: '/trash', label: 'Sampah', Icon: TrashIcon, IconActive: TrashIconSolid },
  { to: '/profile', label: 'Pengaturan', Icon: UserIcon, IconActive: UserIconSolid },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth()
  
  const used = user?.quota?.used || 0
  const total = user?.quota?.total || 0
  const percent = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <aside className={`fixed top-0 left-0 h-dvh ${collapsed ? 'w-24' : 'w-72'} transition-all duration-300 bg-[var(--color-surface)]/40 backdrop-blur-2xl border-r border-[var(--color-glass-border)] flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] group/sidebar`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 bg-[var(--color-surface-solid)] border border-teal-500/30 rounded-full flex items-center justify-center shadow-md text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all z-50 opacity-0 group-hover/sidebar:opacity-100"
      >
        {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
      </button>

      {/* Brand */}
      <div className={`h-20 flex items-center shrink-0 ${collapsed ? 'justify-center px-0' : 'px-6'}`}>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#14b8a6] to-[#0f766e] flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 group-hover:scale-105 transition-all duration-300 border border-white/20 shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" opacity="0.95"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>
          {!collapsed && (
            <span className="font-extrabold text-xl text-[var(--color-text-main)] tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors whitespace-nowrap">
              Panyeppen Cloud
            </span>
          )}
        </Link>
      </div>

      {/* Upload Button */}
      <div className={`mb-8 transition-all ${collapsed ? 'px-4' : 'px-6'}`}>
        <Link
          to="/upload"
          title={collapsed ? "Upload Baru" : ""}
          className={`flex items-center justify-center w-full h-12 text-white font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 border border-white/20 relative overflow-hidden group ${collapsed ? 'rounded-2xl gap-0' : 'rounded-2xl gap-2.5'}`}
          style={{
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            boxShadow: '0 8px 20px -4px rgba(20, 184, 166, 0.4), inset 0 1px 1px rgba(255,255,255,0.3)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <CloudArrowUpIcon className={`relative z-10 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2.5} />
          {!collapsed && <span className="relative z-10 whitespace-nowrap">Upload Baru</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-2 overflow-y-auto overflow-x-hidden ${collapsed ? 'px-4' : 'px-4'}`}>
        {navItems.map(({ to, label, Icon, IconActive, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : ""}
            className={({ isActive }) =>
              `flex items-center px-4 py-3.5 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden ${
                collapsed ? 'justify-center gap-0' : 'justify-start gap-3.5'
              } ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400 bg-[var(--color-surface)]/60 shadow-sm border border-[var(--color-glass-border)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface)]/40 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-teal-500 rounded-r-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                )}
                {isActive && collapsed && (
                  <div className="absolute inset-0 border-2 border-teal-500 rounded-2xl pointer-events-none"></div>
                )}
                <div className={`flex items-center justify-center transition-transform duration-300 shrink-0 ${isActive ? 'scale-110' : ''}`}>
                  {isActive ? <IconActive className="w-5 h-5 drop-shadow-sm" /> : <Icon className="w-5 h-5" />}
                </div>
                {!collapsed && <span className="tracking-wide whitespace-nowrap">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Storage Summary */}
      <div className={`p-5 mt-auto border-t border-[var(--color-glass-border)] bg-[var(--color-surface)]/30 backdrop-blur-xl rounded-tl-3xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)] ${collapsed ? 'px-4 flex flex-col items-center' : ''}`}>
        {!collapsed ? (
          <div className="mb-4">
            <StorageCard used={used} total={total} />
          </div>
        ) : (
          <div className="mb-4 relative w-11 h-11 flex items-center justify-center group" title={`Penyimpanan: ${percent}%`}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r={radius} className="fill-none stroke-[var(--color-border-subtle)]" strokeWidth="4" />
              <circle 
                cx="22" 
                cy="22" 
                r={radius} 
                className="fill-none stroke-teal-500 transition-all duration-1000 ease-out" 
                strokeWidth="4" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <CloudIcon className="absolute w-4 h-4 text-teal-600" />
          </div>
        )}
        <Link 
          to="/profile" 
          title={collapsed ? "Pengaturan Profil" : ""}
          className={`flex items-center bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface-solid)] rounded-2xl transition-all border border-[var(--color-glass-border)] shadow-sm group ${collapsed ? 'p-2 justify-center' : 'p-3 gap-3'}`}
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-inner border border-white/30 group-hover:scale-105 transition-transform shrink-0">
            <span className="text-white text-sm font-bold shadow-sm">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--color-text-main)] truncate tracking-wide group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {user?.displayName || 'Pengguna'}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] truncate font-medium">@{user?.id || 'id'}</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  )
}
