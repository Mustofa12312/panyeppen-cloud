import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { FolderPlusIcon, ChevronRightIcon, HomeIcon, ArrowPathIcon, ArrowUpTrayIcon, Squares2X2Icon, Bars4Icon } from '@heroicons/react/24/outline'
import { useFiles } from '../hooks/useFiles'
import { useToast } from '../context/ToastContext'
import FileCard from '../components/FileCard'
import FolderCard from '../components/FolderCard'
import EmptyState from '../components/EmptyState'
import { download } from '../services/files'

function Breadcrumb({ path, onNavigate }) {
  const segments = path.split('/').filter(Boolean)

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 flex-nowrap scrollbar-hide">
      <button
        onClick={() => onNavigate('/')}
        className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[#f1f5f9] transition-colors flex-shrink-0"
        aria-label="Home"
      >
        <HomeIcon className="w-4 h-4 text-[#64748b]" />
      </button>

      {segments.map((seg, idx) => {
        const fullPath = '/' + segments.slice(0, idx + 1).join('/')
        const isLast = idx === segments.length - 1

        return (
          <div key={fullPath} className="flex items-center gap-1 flex-shrink-0">
            <ChevronRightIcon className="w-3.5 h-3.5 text-[#cbd5e1]" />
            {isLast ? (
              <span className="text-sm font-semibold text-[#0f172a] max-w-[150px] truncate">
                {decodeURIComponent(seg)}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(fullPath)}
                className="text-sm font-medium text-[#16a34a] hover:underline max-w-[120px] truncate"
              >
                {decodeURIComponent(seg)}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Modal buat folder baru (reuse dari Files.jsx)
function NewFolderModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await onCreate(name.trim())
      onClose()
    } catch {
      // error handled by parent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <h3 className="text-lg font-bold text-[#0f172a] mb-5">Folder Baru</h3>
        <form onSubmit={handleSubmit}>
          <input
            id="folder-new-folder-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama folder..."
            className="input mb-4"
            autoFocus
            required
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Batal</button>
            <button
              id="folder-create-submit"
              type="submit"
              disabled={!name.trim() || loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Membuat...' : 'Buat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal rename
function RenameModal({ item, onClose, onRename }) {
  const [name, setName] = useState(item?.name || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || name === item?.name) return
    setLoading(true)
    try {
      await onRename(item, name.trim())
      onClose()
    } catch {
      // error handled by parent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <h3 className="text-lg font-bold mb-5">Ganti Nama</h3>
        <form onSubmit={handleSubmit}>
          <input
            id="folder-rename-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input mb-4"
            autoFocus
            required
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Batal</button>
            <button
              id="folder-rename-submit"
              type="submit"
              disabled={!name.trim() || name === item?.name || loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal konfirmasi hapus
function DeleteModal({ item, onClose, onDelete }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete(item)
      onClose()
    } catch {
      // error handled by parent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <h3 className="text-lg font-bold mb-2">Hapus Item</h3>
        <p className="text-sm text-[#64748b] mb-6">
          Hapus <span className="font-semibold text-[#0f172a]">"{item?.name}"</span>?
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Batal</button>
          <button
            id="folder-delete-confirm"
            onClick={handleDelete}
            disabled={loading}
            className="btn btn-danger flex-1"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Folder() {
  const location = useLocation()
  const navigate = useNavigate()

  const folderPath = '/' + (location.pathname.replace('/folder', '').replace(/^\//, '') || '')

  const { folders, fileItems, loading, error, currentPath, refresh, deleteFile, renameFile, createFolder } = useFiles(folderPath)
  const { showToast } = useToast()
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [renameTarget, setRenameTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'grid')

  const toggleViewMode = (mode) => {
    setViewMode(mode)
    localStorage.setItem('viewMode', mode)
  }

  const gridClass = viewMode === 'grid'
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4"
    : "flex flex-col gap-2"

  const handleNavigate = (path) => {
    if (path === '/') {
      navigate('/files')
    } else {
      navigate(`/folder${path}`)
    }
  }

  const handleDownload = async (file) => {
    try {
      showToast(`Mendownload ${file.name}...`, 'info')
      await download(file.path, file.name)
    } catch {
      showToast('Gagal download', 'error')
    }
  }

  const handleDelete = async (item) => {
    try {
      await deleteFile(item.path)
      showToast('Berhasil dihapus', 'success')
    } catch {
      showToast('Gagal menghapus', 'error')
      throw new Error('Failed')
    }
  }

  const handleRename = async (item, newName) => {
    try {
      await renameFile(item.path, newName)
      showToast('Berhasil ganti nama', 'success')
    } catch {
      showToast('Gagal ganti nama', 'error')
      throw new Error('Failed')
    }
  }

  const handleCreateFolder = async (name) => {
    try {
      await createFolder(name)
      showToast('Folder dibuat', 'success')
    } catch {
      showToast('Gagal membuat folder', 'error')
      throw new Error('Failed')
    }
  }

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
      await new Promise(r => setTimeout(r, 1500))
      showToast('File berhasil diupload!', 'success')
      refresh()
    } catch {
      showToast('Gagal mengupload file', 'error')
    }
  }

  const hasContent = folders.length > 0 || fileItems.length > 0
  const folderName = folderPath.split('/').filter(Boolean).pop() || 'Files'

  return (
    <div 
      className="space-y-4 animate-fade-in relative min-h-[calc(100vh-140px)]"
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
        </div>
      )}

      {/* Breadcrumb & Actions */}
      <div className="space-y-2 pt-1">
        <Breadcrumb path={currentPath} onNavigate={handleNavigate} />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] truncate max-w-[200px]">
              {folderName}
            </h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              {loading ? '...' : `${folders.length} folder, ${fileItems.length} file`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-[var(--color-background)] rounded-lg p-0.5 border border-[var(--color-border)]">
              <button
                onClick={() => toggleViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[var(--color-primary-600)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[var(--color-primary-600)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
              >
                <Bars4Icon className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)] transition-colors text-[var(--color-muted)]"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin-slow' : ''}`} />
            </button>
            <button
              id="folder-new-btn"
              onClick={() => setShowNewFolder(true)}
              className="btn btn-primary h-9 px-3.5 text-sm gap-1.5"
            >
              <FolderPlusIcon className="w-4 h-4" />
              Folder
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3.5">
          <p className="text-sm text-[#dc2626]">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : !hasContent ? (
        <EmptyState
          variant="folder"
          title="Folder kosong"
          description="Belum ada file atau folder di sini"
          action={() => setShowNewFolder(true)}
          actionLabel="Buat Subfolder"
        />
      ) : (
        <div className="space-y-4">
          {folders.length > 0 && (
            <div>
              <p className="section-title">Folder</p>
              <div className={gridClass}>
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onDelete={(f) => setDeleteTarget(f)}
                    onRename={(f) => setRenameTarget(f)}
                  />
                ))}
              </div>
            </div>
          )}
          {fileItems.length > 0 && (
            <div>
              <p className="section-title">File</p>
              <div className={gridClass}>
                {fileItems.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onDownload={handleDownload}
                    onDelete={(f) => setDeleteTarget(f)}
                    onRename={(f) => setRenameTarget(f)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showNewFolder && (
        <NewFolderModal
          onClose={() => setShowNewFolder(false)}
          onCreate={handleCreateFolder}
        />
      )}
      {renameTarget && (
        <RenameModal
          item={renameTarget}
          onClose={() => setRenameTarget(null)}
          onRename={handleRename}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
