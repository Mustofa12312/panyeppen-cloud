import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FolderPlusIcon, ChevronRightIcon, HomeIcon, ArrowPathIcon,
  ArrowUpTrayIcon, Squares2X2Icon, Bars4Icon, AdjustmentsHorizontalIcon,
  XMarkIcon, TrashIcon, ArchiveBoxArrowDownIcon, DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { useFiles } from '../hooks/useFiles'
import { useToast } from '../context/ToastContext'
import FileCard from '../components/FileCard'
import FolderCard from '../components/FolderCard'
import EmptyState from '../components/EmptyState'
import { download, downloadZip, createShareLink } from '../services/files'

function Breadcrumb({ path, onNavigate }) {
  const segments = path.split('/').filter(Boolean)
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 flex-nowrap scrollbar-hide">
      <button onClick={() => onNavigate('/')} className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[#f1f5f9] transition-colors flex-shrink-0">
        <HomeIcon className="w-4 h-4 text-[#64748b]" />
      </button>
      {segments.map((seg, idx) => {
        const fullPath = '/' + segments.slice(0, idx + 1).join('/')
        const isLast = idx === segments.length - 1
        return (
          <div key={fullPath} className="flex items-center gap-1 flex-shrink-0">
            <ChevronRightIcon className="w-3.5 h-3.5 text-[#cbd5e1]" />
            {isLast ? (
              <span className="text-sm font-semibold text-[#0f172a] max-w-[150px] truncate">{decodeURIComponent(seg)}</span>
            ) : (
              <button onClick={() => onNavigate(fullPath)} className="text-sm font-medium text-[#16a34a] hover:underline max-w-[120px] truncate">{decodeURIComponent(seg)}</button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function NewFolderModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try { await onCreate(name.trim()); onClose() } finally { setLoading(false) }
  }
  return (
    <div className="modal-backdrop z-[60]" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <h3 className="text-lg font-bold text-[#0f172a] mb-5">Folder Baru</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama folder..." className="input mb-4" autoFocus required />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all">Batal</button>
            <button type="submit" disabled={!name.trim() || loading} className="flex-1 h-12 rounded-xl font-bold text-sm text-white shadow-md bg-teal-600 transition-all active:scale-95 disabled:opacity-50">{loading ? 'Membuat...' : 'Buat'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RenameModal({ item, onClose, onRename }) {
  const [name, setName] = useState(item?.name || '')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || name === item?.name) return
    setLoading(true)
    try { await onRename(item, name.trim()); onClose() } finally { setLoading(false) }
  }
  return (
    <div className="modal-backdrop z-[60]" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <h3 className="text-lg font-bold mb-5">Ganti Nama</h3>
        <form onSubmit={handleSubmit}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input mb-4" autoFocus required />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600">Batal</button>
            <button type="submit" disabled={!name.trim() || name === item?.name || loading} className="flex-1 h-12 rounded-xl font-bold text-sm text-white bg-teal-600">{loading ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MoveModal({ item, currentPath, onClose, onMove }) {
  const [target, setTarget] = useState('/')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onMove(item, target); onClose() } finally { setLoading(false) }
  }
  return (
    <div className="modal-backdrop z-[60]" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <h3 className="text-lg font-bold mb-2">Pindahkan Item</h3>
        <p className="text-sm text-slate-500 mb-4 truncate">Pindahkan "{item?.name}" ke:</p>
        <form onSubmit={handleSubmit}>
          <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="/Path/Tujuan" className="input mb-4" required />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600">Batal</button>
            <button type="submit" disabled={!target.trim() || loading} className="flex-1 h-12 rounded-xl font-bold text-sm text-white bg-teal-600">{loading ? 'Memindah...' : 'Pindah'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ShareModal({ item, onClose }) {
  const [shareData, setShareData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [password, setPassword] = useState('')
  const [expiresInDays, setExpiresInDays] = useState('')
  const { showToast } = useToast()

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await createShareLink(item.path, password, expiresInDays)
      setShareData(res)
    } catch {
      showToast('Gagal membuat tautan', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (shareData) {
      const fullUrl = `${window.location.origin}${shareData.url}`
      navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="modal-backdrop z-[60]" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <h3 className="text-lg font-bold mb-2">Bagikan Tautan Publik</h3>
        <p className="text-sm text-slate-500 mb-5">Bagikan "{item?.name}" ke orang lain secara aman.</p>
        
        {!shareData ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Kata Sandi (Opsional)</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kosongkan jika tidak perlu" className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Berlaku Selama (Hari, Opsional)</label>
              <input type="number" min="1" max="365" value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)} placeholder="Contoh: 7" className="input" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200">Batal</button>
              <button type="submit" disabled={loading} className="flex-1 h-12 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700">{loading ? 'Membuat...' : 'Buat Tautan'}</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-slate-100 rounded-xl break-all text-sm font-medium text-slate-700 border border-slate-200 select-all">
              {`${window.location.origin}${shareData.url}`}
            </div>
            <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors">
              <DocumentDuplicateIcon className="w-5 h-5" />
              {copied ? 'Tersalin!' : 'Salin Tautan'}
            </button>
            <button onClick={onClose} className="w-full h-12 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Tutup</button>
          </div>
        )}
      </div>
    </div>
  )
}

function DeleteModal({ title, description, onClose, onDelete }) {
  const [loading, setLoading] = useState(false)
  const handleDelete = async () => {
    setLoading(true)
    try { await onDelete(); onClose() } finally { setLoading(false) }
  }
  return (
    <div className="modal-backdrop z-[60]" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <h3 className="text-lg font-bold mb-2 text-red-600">{title}</h3>
        <p className="text-sm text-[#64748b] mb-6">{description}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-600">Batal</button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 h-12 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700">{loading ? 'Menghapus...' : 'Hapus'}</button>
        </div>
      </div>
    </div>
  )
}

export default function Folder() {
  const location = useLocation()
  const navigate = useNavigate()
  const folderPath = '/' + (location.pathname.replace('/folder', '').replace(/^\//, '') || '')
  
  const { folders, fileItems, loading, error, currentPath, refresh, deleteFile, bulkDeleteFiles, renameFile, createFolder } = useFiles(folderPath)
  const { showToast } = useToast()
  
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [renameTarget, setRenameTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [moveTarget, setMoveTarget] = useState(null)
  const [shareTarget, setShareTarget] = useState(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'grid')
  
  const [sortBy, setSortBy] = useState('name-asc')
  const [selectedItems, setSelectedItems] = useState([])
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Sort logic
  const sortFunc = (a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
    if (sortBy === 'date-desc') return new Date(b.lastModified) - new Date(a.lastModified)
    if (sortBy === 'date-asc') return new Date(a.lastModified) - new Date(b.lastModified)
    if (sortBy === 'size-desc') return (b.size || 0) - (a.size || 0)
    if (sortBy === 'size-asc') return (a.size || 0) - (b.size || 0)
    return 0
  }

  const sortedFolders = useMemo(() => [...folders].sort(sortFunc), [folders, sortBy])
  const sortedFiles = useMemo(() => {
    let filtered = [...fileItems]
    if (categoryFilter !== 'all') {
      const extMatch = (file, exts) => exts.some(ext => file.name.toLowerCase().endsWith(ext))
      if (categoryFilter === 'image') filtered = filtered.filter(f => extMatch(f, ['.jpg', '.jpeg', '.png', '.gif', '.webp']))
      else if (categoryFilter === 'document') filtered = filtered.filter(f => extMatch(f, ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv']))
      else if (categoryFilter === 'video') filtered = filtered.filter(f => extMatch(f, ['.mp4', '.webm', '.mkv', '.avi']))
      else if (categoryFilter === 'audio') filtered = filtered.filter(f => extMatch(f, ['.mp3', '.wav', '.ogg']))
    }
    return filtered.sort(sortFunc)
  }, [fileItems, sortBy, categoryFilter])

  const toggleViewMode = (mode) => {
    setViewMode(mode)
    localStorage.setItem('viewMode', mode)
  }

  const handleNavigate = (path) => {
    setSelectedItems([])
    if (path === '/') navigate('/files')
    else navigate(`/folder${path}`)
  }

  const toggleSelect = (item) => {
    setSelectedItems(prev => 
      prev.some(i => i.id === item.id) 
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    )
  }

  const handleDownload = async (file) => {
    try {
      showToast(`Mendownload ${file.name}...`, 'info')
      await download(file.path, file.name)
    } catch { showToast('Gagal download', 'error') }
  }

  const handleBulkDownload = async () => {
    try {
      showToast('Menyiapkan ZIP...', 'info')
      const paths = selectedItems.map(i => i.path)
      await downloadZip(paths, `Panyeppen_Cloud_${new Date().getTime()}.zip`)
      setSelectedItems([])
    } catch { showToast('Gagal membuat ZIP', 'error') }
  }

  const handleBulkDelete = async () => {
    try {
      const paths = selectedItems.map(i => i.path)
      await bulkDeleteFiles(paths)
      showToast(`${paths.length} item dihapus`, 'success')
      setSelectedItems([])
    } catch { showToast('Gagal menghapus massal', 'error') }
  }

  const handleRename = async (item, newName) => {
    try {
      await renameFile(item.path, newName)
      showToast('Berhasil ganti nama', 'success')
    } catch { showToast('Gagal ganti nama', 'error') }
  }

  const handleMove = async (item, targetFolder) => {
    try {
      const newPath = targetFolder.endsWith('/') ? `${targetFolder}${item.name}` : `${targetFolder}/${item.name}`
      await renameFile(item.path, newPath)
      showToast('Berhasil dipindah', 'success')
    } catch { showToast('Gagal memindah', 'error') }
  }

  const handleDropItemToFolder = async (item, folderPath) => {
    if (item.path === folderPath || item.path.startsWith(folderPath + '/')) return // Prevent moving to self/child
    handleMove(item, folderPath)
  }

  const gridClass = viewMode === 'grid'
    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4"
    : "flex flex-col gap-2"

  const hasContent = folders.length > 0 || fileItems.length > 0
  const folderName = folderPath.split('/').filter(Boolean).pop() || 'Files'

  return (
    <div 
      className="space-y-4 animate-fade-in relative min-h-[calc(100vh-140px)] pb-24"
      onDragOver={(e) => { e.preventDefault(); if(!isDragging) setIsDragging(true) }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
      onDrop={async (e) => {
        e.preventDefault(); setIsDragging(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length === 0) return
        showToast(`Memulai upload ${files.length} file...`, 'info')
        // TODO: integrate with global upload context in phase 4/5
        setTimeout(() => refresh(), 2000)
      }}
    >
      {/* Overlay Drag & Drop untuk eksternal file */}
      {isDragging && (
        <div className="absolute inset-0 z-40 rounded-2xl bg-teal-50/90 backdrop-blur-sm border-2 border-dashed border-teal-500 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl animate-bounce mb-4">
            <ArrowUpTrayIcon className="w-10 h-10 text-teal-600" />
          </div>
          <p className="text-xl font-bold text-teal-800">Lepaskan file di sini</p>
        </div>
      )}

      {/* Breadcrumb & Actions */}
      <div className="space-y-2 pt-1">
        <Breadcrumb path={currentPath} onNavigate={handleNavigate} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] truncate max-w-[250px]">{folderName}</h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">{loading ? '...' : `${folders.length} folder, ${fileItems.length} file`}</p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {/* Sort Dropdown */}
            <div className="relative group/sort">
              <button className="flex items-center gap-1.5 h-10 px-3 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 focus:ring-2 ring-teal-500/20 outline-none">
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                Urutkan
              </button>
              <div className="absolute right-0 top-11 w-48 bg-white shadow-xl rounded-xl border border-slate-100 p-1 opacity-0 pointer-events-none group-focus-within/sort:opacity-100 group-focus-within/sort:pointer-events-auto transition-opacity z-20">
                {[
                  { id: 'name-asc', label: 'Nama (A-Z)' }, { id: 'name-desc', label: 'Nama (Z-A)' },
                  { id: 'date-desc', label: 'Terbaru' }, { id: 'date-asc', label: 'Terlama' },
                  { id: 'size-desc', label: 'Terbesar' }, { id: 'size-asc', label: 'Terkecil' }
                ].map(opt => (
                  <button key={opt.id} onClick={() => setSortBy(opt.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${sortBy === opt.id ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-inner flex-shrink-0">
              <button onClick={() => toggleViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}><Squares2X2Icon className="w-5 h-5" /></button>
              <button onClick={() => toggleViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}><Bars4Icon className="w-5 h-5" /></button>
            </div>
            
            <button onClick={refresh} disabled={loading} className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"><ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin-slow' : ''}`} /></button>
            
            <button onClick={() => setShowNewFolder(true)} className="flex items-center justify-center gap-1.5 h-10 px-4 text-white rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 shadow-md transition-all flex-shrink-0">
              <FolderPlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Folder Baru</span>
            </button>
          </div>
        </div>
        
        {/* Quick Category Filters */}
        {folderPath === '/' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-2 scrollbar-hide">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'image', label: 'Gambar' },
              { id: 'document', label: 'Dokumen' },
              { id: 'video', label: 'Video' },
              { id: 'audio', label: 'Audio' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  categoryFilter === cat.id 
                    ? 'bg-teal-600 text-white shadow-md' 
                    : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3.5"><p className="text-sm text-red-600">{error}</p></div>}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : !hasContent ? (
        <EmptyState variant="folder" title="Folder kosong" description="Belum ada file atau folder di sini" action={() => setShowNewFolder(true)} actionLabel="Buat Subfolder" />
      ) : (
        <div className="space-y-4">
          {sortedFolders.length > 0 && (
            <div>
              <p className="section-title mb-2">Folder</p>
              <div className={gridClass}>
                {sortedFolders.map(folder => (
                  <FolderCard
                    key={folder.id} folder={folder}
                    selected={selectedItems.some(i => i.id === folder.id)}
                    onSelect={toggleSelect}
                    onDropItem={handleDropItemToFolder}
                    onDelete={f => setDeleteTarget(f)}
                    onRename={f => setRenameTarget(f)}
                    onMove={f => setMoveTarget(f)}
                    onShare={f => setShareTarget(f)}
                  />
                ))}
              </div>
            </div>
          )}
          {sortedFiles.length > 0 && (
            <div>
              <p className="section-title mb-2">File</p>
              <div className={gridClass}>
                {sortedFiles.map(file => (
                  <FileCard
                    key={file.id} file={file}
                    selected={selectedItems.some(i => i.id === file.id)}
                    onSelect={toggleSelect}
                    onDownload={handleDownload}
                    onDelete={f => setDeleteTarget(f)}
                    onRename={f => setRenameTarget(f)}
                    onMove={f => setMoveTarget(f)}
                    onShare={f => setShareTarget(f)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Bar for Multi-select */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-full shadow-2xl border border-slate-700/50 px-4 py-2 flex items-center gap-4">
            <span className="text-white font-bold text-sm bg-teal-500 rounded-full w-6 h-6 flex items-center justify-center">{selectedItems.length}</span>
            <div className="h-6 w-px bg-slate-700"></div>
            <button onClick={handleBulkDownload} className="text-sm font-semibold text-slate-200 hover:text-white flex items-center gap-1.5" title="Download ZIP">
              <ArchiveBoxArrowDownIcon className="w-5 h-5" /> ZIP
            </button>
            <button onClick={() => setShowBulkDelete(true)} className="text-sm font-semibold text-red-400 hover:text-red-300 flex items-center gap-1.5 ml-2" title="Hapus">
              <TrashIcon className="w-5 h-5" /> Hapus
            </button>
            <button onClick={() => setSelectedItems([])} className="ml-2 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showNewFolder && <NewFolderModal onClose={() => setShowNewFolder(false)} onCreate={createFolder} />}
      {renameTarget && <RenameModal item={renameTarget} onClose={() => setRenameTarget(null)} onRename={handleRename} />}
      {moveTarget && <MoveModal item={moveTarget} currentPath={currentPath} onClose={() => setMoveTarget(null)} onMove={handleMove} />}
      {shareTarget && <ShareModal item={shareTarget} onClose={() => setShareTarget(null)} />}
      
      {deleteTarget && (
        <DeleteModal 
          title="Hapus Item" description={`Yakin ingin menghapus "${deleteTarget.name}"?`} 
          onClose={() => setDeleteTarget(null)} onDelete={async () => { await deleteFile(deleteTarget.path); showToast('Dihapus', 'success') }} 
        />
      )}
      
      {showBulkDelete && (
        <DeleteModal 
          title="Hapus Massal" description={`Yakin ingin menghapus ${selectedItems.length} item secara permanen?`} 
          onClose={() => setShowBulkDelete(false)} onDelete={handleBulkDelete} 
        />
      )}
    </div>
  )
}
