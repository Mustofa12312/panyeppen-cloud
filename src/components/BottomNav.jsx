import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  ShareIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  FolderIcon as FolderIconSolid,
  ArrowUpTrayIcon as ArrowUpTrayIconSolid,
  ShareIcon as ShareIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid'

const navItems = [
  {
    to: '/',
    label: 'Home',
    Icon: HomeIcon,
    IconActive: HomeIconSolid,
    end: true,
  },
  {
    to: '/files',
    label: 'Files',
    Icon: FolderIcon,
    IconActive: FolderIconSolid,
  },
  {
    to: '/upload',
    label: 'Upload',
    Icon: ArrowUpTrayIcon,
    IconActive: ArrowUpTrayIconSolid,
    isUpload: true,
  },
  {
    to: '/shared',
    label: 'Shared',
    Icon: ShareIcon,
    IconActive: ShareIconSolid,
  },
  {
    to: '/profile',
    label: 'Profile',
    Icon: UserIcon,
    IconActive: UserIconSolid,
  },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--color-glass-border)] safe-bottom rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-around max-w-2xl mx-auto h-16 px-4">
        {navItems.map(({ to, label, Icon, IconActive, end, isUpload }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 min-w-[3.5rem] h-full transition-all duration-300 ${
                isActive ? 'text-[var(--color-primary-600)] scale-105' : 'text-[var(--color-muted)] hover:text-[var(--color-text-light)]'
              } ${isUpload ? 'relative' : ''}`
            }
            aria-label={label}
          >
            {({ isActive }) =>
              isUpload ? (
                // Upload button — premium FAB style
                <div className="flex flex-col items-center gap-1 -mt-5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border border-white/20 shadow-[0_4px_14px_0_rgba(20,184,166,0.3)] ${
                      isActive
                        ? 'bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-800)] scale-95 shadow-[0_2px_8px_0_rgba(20,184,166,0.5)]'
                        : 'bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]'
                    }`}
                  >
                    <ArrowUpTrayIconSolid className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                </div>
              ) : (
                <>
                  {isActive ? (
                    <IconActive className="w-6 h-6 drop-shadow-sm" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                  <span
                    className={`text-[10px] font-bold tracking-wide transition-colors ${
                      isActive ? 'text-[var(--color-primary-700)]' : 'text-[var(--color-muted)]'
                    }`}
                  >
                    {label}
                  </span>
                </>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
