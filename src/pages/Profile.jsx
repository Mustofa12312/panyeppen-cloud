import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserCircleIcon,
  ShieldCheckIcon,
  CloudIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import StorageCard from '../components/StorageCard'

function ProfileAvatar({ name }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  return (
    <div className="w-20 h-20 rounded-3xl bg-green-600 bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg shadow-green-200">
      <span className="text-4xl font-bold text-white">{initial}</span>
    </div>
  )
}

function MenuItem({ icon: Icon, label, description, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 transition-colors rounded-2xl ${
        danger ? 'text-[#dc2626]' : 'text-[#0f172a]'
      }`}
      style={{ background: 'transparent' }}
      onMouseEnter={(e) => e.currentTarget.style.background = danger ? '#fef2f2' : '#f8fafc'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          danger ? 'bg-[#fef2f2]' : 'bg-[#f8fafc]'
        }`}
      >
        <Icon className={`w-5 h-5 ${danger ? 'text-[#dc2626]' : 'text-[#64748b]'}`} />
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-semibold ${danger ? 'text-[#dc2626]' : 'text-[#0f172a]'}`}>
          {label}
        </p>
        {description && <p className="text-xs text-[#94a3b8] mt-0.5">{description}</p>}
      </div>
      <ChevronRightIcon className={`w-4 h-4 ${danger ? 'text-[#dc2626]' : 'text-[#cbd5e1]'}`} />
    </button>
  )
}

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile header */}
      <div className="pt-1">
        <h2 className="text-xl font-bold text-[#0f172a]">Profil</h2>
      </div>

      <div className="card p-6 flex flex-col items-center text-center">
        <ProfileAvatar name={user?.displayName || user?.id} />
        <h3 className="text-xl font-bold text-[#0f172a] mt-4">
          {user?.displayName || user?.id}
        </h3>
        <p className="text-sm text-[#64748b] mt-1">@{user?.id}</p>
        {user?.email && (
          <p className="text-sm text-[#94a3b8] mt-0.5">{user.email}</p>
        )}
        <div className="mt-3">
          <span className="badge bg-[#f0fdf4] text-[#16a34a]">
            Pengguna Aktif
          </span>
        </div>
      </div>

      {/* Storage */}
      <StorageCard
        used={user?.quota?.used || 0}
        total={user?.quota?.total || 0}
      />

      {/* Info detail */}
      <div className="card p-5">
        <p className="section-title mb-4">Informasi Akun</p>
        <div className="space-y-3">
          <InfoRow label="Nama" value={user?.displayName || '-'} />
          <InfoRow label="Username" value={`@${user?.id || '-'}`} />
          <InfoRow label="Email" value={user?.email || '-'} />
        </div>
      </div>

      {/* Menu */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-[#f1f5f9]">
          <div className="p-2">
            <MenuItem
              icon={UserCircleIcon}
              label="Akun"
              description="Informasi dan pengaturan akun"
              onClick={() => {}}
            />
          </div>
          <div className="p-2">
            <MenuItem
              icon={ShieldCheckIcon}
              label="Keamanan"
              description="Ganti password, sesi aktif"
              onClick={() => {}}
            />
          </div>
          <div className="p-2">
            <MenuItem
              icon={CloudIcon}
              label="Storage"
              description="Kelola penyimpanan"
              onClick={() => {}}
            />
          </div>
          <div className="p-2">
            <MenuItem
              icon={ArrowRightOnRectangleIcon}
              label="Keluar"
              description="Logout dari akun ini"
              onClick={() => setShowLogoutConfirm(true)}
              danger
            />
          </div>
        </div>
      </div>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-sheet-handle" />
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#fef2f2] flex items-center justify-center mb-4">
                <ArrowRightOnRectangleIcon className="w-7 h-7 text-[#dc2626]" />
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] mb-1">Keluar?</h3>
              <p className="text-sm text-[#64748b]">
                Kamu akan keluar dari akun <span className="font-semibold">{user?.displayName}</span>.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-12 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
                style={{ background: 'rgba(241,245,249,0.9)', color: '#475569' }}
              >
                Batal
              </button>
              <button
                id="logout-confirm"
                onClick={handleLogout}
                className="flex-1 h-12 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
                style={{ background: '#ef4444', color: 'white', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-[#0f172a]">{value}</span>
    </div>
  )
}
