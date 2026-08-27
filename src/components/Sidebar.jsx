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
import { useAuth } from '../hooks/useAuth'
import StorageCard from './StorageCard'

const navItems = [
  { to: '/', label: 'Dashboard', Icon: HomeIcon, IconActive: HomeIconSolid, end: true },
  { to: '/files', label: 'Semua File', Icon: FolderIcon, IconActive: FolderIconSolid },
  { to: '/shared', label: 'Dibagikan', Icon: ShareIcon, IconActive: ShareIconSolid },
  { to: '/trash', label: 'Sampah', Icon: TrashIcon, IconActive: TrashIconSolid },
  { to: '/profile', label: 'Pengaturan', Icon: UserIcon, IconActive: UserIconSolid },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="fixed top-0 left-0 h-dvh w-72 glass border-r border-[var(--color-glass-border)] flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Brand */}
      <div className="h-20 flex items-center px-6 shrink-0">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/40 group-hover:scale-105 transition-all duration-300 border border-white/10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" opacity="0.9"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>
          <span className="font-extrabold text-lg text-[var(--color-text)] tracking-tight group-hover:text-[var(--color-primary-600)] transition-colors">
            Panyeppen Cloud
          </span>
        </Link>
      </div>

      {/* Upload Button */}
      <div className="px-5 mb-6">
        <Link
          to="/upload"
          className="flex items-center justify-center gap-2 w-full h-12 text-white rounded-xl font-bold transition-all active:scale-95 border border-white/20"
          style={{
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            boxShadow: '0 4px 14px 0 rgba(20, 184, 166, 0.3)',
          }}
        >
          <CloudArrowUpIcon className="w-5 h-5" strokeWidth={2.5} />
          Upload Baru
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map(({ to, label, Icon, IconActive, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-teal-50 text-[var(--color-primary-700)] shadow-sm border border-teal-100/50'
                  : 'text-[var(--color-text-light)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)] border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? <IconActive className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile & Storage Summary */}
      <div className="p-5 mt-auto border-t border-[var(--color-glass-border)] bg-white/30 backdrop-blur-md">
        <div className="mb-4 scale-95 origin-bottom">
          <StorageCard used={user?.quota?.used || 0} total={user?.quota?.total || 0} />
        </div>
        <Link to="/profile" className="flex items-center gap-3 hover:bg-white/50 p-2.5 -mx-2.5 rounded-2xl transition-all border border-transparent hover:border-white/60 hover:shadow-sm">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center shadow-inner border border-white/20">
            <span className="text-white text-sm font-bold">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--color-text)] truncate tracking-wide">
              {user?.displayName || 'Pengguna'}
            </p>
            <p className="text-xs text-[var(--color-text-light)] truncate font-medium">@{user?.id || 'id'}</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
