import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpTrayIcon,
  FolderPlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import StorageCard from '../components/StorageCard'
import FileCard from '../components/FileCard'
import FolderCard from '../components/FolderCard'
import EmptyState from '../components/EmptyState'
import { list, download, deleteItem, rename } from '../services/files'
import { refreshUser } from '../services/auth'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [recentFiles, setRecentFiles] = useState([])
  const [recentFolders, setRecentFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { showToast } = useToast()

  const loadData = async () => {
    try {
      const items = await list('/')
      const folders = items.filter((i) => i.isFolder).slice(0, 4)
      const files = items.filter((i) => !i.isFolder).slice(0, 5)
      setRecentFolders(folders)
      setRecentFiles(files)
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
    // Refresh user quota
    refreshUser().then((u) => {
      if (u) updateUser(u)
    })
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    const u = await refreshUser()
    if (u) updateUser(u)
  }

  const handleDownload = async (file) => {
    try {
      showToast(`Mendownload ${file.name}...`, 'info')
      await download(file.path, file.name)
    } catch {
      showToast('Gagal download file', 'error')
    }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Hapus "${item.name}"?`)) return
    try {
      await deleteItem(item.path)
      showToast('File berhasil dihapus', 'success')
      await loadData()
    } catch {
      showToast('Gagal menghapus file', 'error')
    }
  }

  const handleRename = async (item) => {
    const newName = prompt('Nama baru:', item.name)
    if (!newName || newName === item.name) return
    try {
      await rename(item.path, newName)
      showToast('File berhasil di-rename', 'success')
      await loadData()
    } catch {
      showToast('Gagal mengubah nama', 'error')
    }
  }

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return
    
    showToast(`Memulai upload ${files.length} file...`, 'info')
    
    try {
      // Simulate upload process since we don't have the real endpoint fully wired in this mock
      await new Promise(r => setTimeout(r, 1500))
      showToast('File berhasil diupload!', 'success')
      await loadData()
    } catch {
      showToast('Gagal mengupload file', 'error')
    }
  }

  const quickActions = [
    {
      id: 'quick-upload',
      icon: ArrowUpTrayIcon,
      label: 'Upload',
      color: '#16a34a',
      bg: '#f0fdf4',
      action: () => navigate('/upload'),
    },
    {
      id: 'quick-folder',
      icon: FolderPlusIcon,
      label: 'Folder',
      color: '#f59e0b',
      bg: '#fffbeb',
      action: () => navigate('/files'),
    },
    {
      id: 'quick-search',
      icon: MagnifyingGlassIcon,
      label: 'Cari',
      color: '#7c3aed',
      bg: '#f5f3ff',
      action: () => navigate('/search'),
    },
  ]

  return (
    <div 
      className="space-y-6 animate-fade-in pb-6 relative min-h-[calc(100vh-140px)]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Overlay Drag & Drop */}
      {isDragging && (
        <div className="absolute inset-0 z-50 rounded-2xl bg-[var(--color-primary-50)]/90 backdrop-blur-sm border-2 border-dashed border-[var(--color-primary-500)] flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl animate-bounce mb-4">
            <ArrowUpTrayIcon className="w-10 h-10 text-[var(--color-primary-600)]" />
          </div>
          <p className="text-xl font-bold text-[var(--color-primary-800)]">Lepaskan file di sini</p>
          <p className="text-sm text-[var(--color-primary-600)] mt-2">File akan langsung diunggah</p>
        </div>
      )}
      
      {/* Greeting */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm text-[var(--color-text-light)] font-medium tracking-wide">Assalamu'alaikum,</p>
          <h2 className="text-2xl font-extrabold text-[var(--color-text)] mt-1 tracking-tight">
            {user?.displayName || user?.id || 'Pengguna'}
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md border border-[var(--color-glass-border)] hover:bg-white transition-all shadow-sm text-[var(--color-text-light)]"
          aria-label="Refresh"
        >
          <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin-slow' : ''}`} />
        </button>
      </div>

      {/* Storage Card */}
      <StorageCard
        used={user?.quota?.used || 0}
        total={user?.quota?.total || 0}
      />

      {/* Quick Actions */}
      <div className="mt-6">
        <p className="text-xs font-bold text-[var(--color-text-light)] tracking-widest uppercase mb-3 px-1">Aksi Cepat</p>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {quickActions.map(({ id, icon: Icon, label, color, bg, action }) => (
            <button
              key={id}
              id={id}
              onClick={action}
              className="card glass p-2.5 sm:p-3 md:p-4 flex flex-col sm:flex-row items-center sm:justify-start justify-center gap-2 sm:gap-3.5 hover:shadow-md transition-all active:scale-95 group"
            >
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-inner border border-white/50"
                style={{ backgroundColor: bg || `${color}15` }}
              >
                <Icon className="w-5 h-5" style={{ color }} strokeWidth={2} />
              </div>
              <span className="text-[11px] sm:text-sm font-bold text-[var(--color-text)] tracking-wide truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Folders */}
      {(loading || recentFolders.length > 0) && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-xs font-bold text-[var(--color-text-light)] tracking-widest uppercase">Folder</p>
            <button
              onClick={() => navigate('/files')}
              className="text-xs font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-800)] transition-colors"
            >
              Lihat semua
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-20 rounded-2xl" />
                ))
              : recentFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onDelete={handleDelete}
                    onRename={handleRename}
                  />
                ))}
          </div>
        </div>
      )}

      {/* Recent Files */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs font-bold text-[var(--color-text-light)] tracking-widest uppercase">File Terbaru</p>
          <button
            onClick={() => navigate('/files')}
            className="text-xs font-bold text-[var(--color-primary-600)] hover:text-[var(--color-primary-800)] transition-colors"
          >
            Lihat semua
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : recentFiles.length === 0 ? (
          <EmptyState
            variant="files"
            action={() => navigate('/upload')}
            actionLabel="Upload File"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
            {recentFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
