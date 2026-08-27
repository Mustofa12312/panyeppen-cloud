import { useState, useEffect } from 'react'
import { TrashIcon, ArrowUturnLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getTrash, restoreTrash, deleteTrash } from '../services/files'
import { useToast } from '../context/ToastContext'
import EmptyState from '../components/EmptyState'
import { formatFileSize } from '../utils/formatFileSize'

export default function Trash() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const loadTrash = async () => {
    setLoading(true)
    try {
      const data = await getTrash()
      setItems(data)
    } catch {
      showToast('Gagal memuat tempat sampah', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrash()
  }, [])

  const handleRestore = async (id) => {
    try {
      await restoreTrash(id)
      showToast('Item berhasil dipulihkan', 'success')
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      showToast('Gagal memulihkan item', 'error')
    }
  }

  const handleDelete = async (id = null) => {
    if (!window.confirm(id ? 'Hapus item ini secara permanen?' : 'Kosongkan semua isi tempat sampah? Aksi ini tidak dapat dibatalkan.')) return
    try {
      await deleteTrash(id)
      showToast(id ? 'Item dihapus permanen' : 'Tempat sampah dikosongkan', 'success')
      if (id) {
        setItems(prev => prev.filter(i => i.id !== id))
      } else {
        setItems([])
      }
    } catch {
      showToast('Gagal menghapus', 'error')
    }
  }

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tempat Sampah</h2>
          <p className="text-xs text-slate-500 mt-0.5">Item yang dihapus akan tersimpan di sini</p>
        </div>
        
        {items.length > 0 && (
          <button onClick={() => handleDelete(null)} className="btn bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
            <TrashIcon className="w-4 h-4" />
            Kosongkan
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState 
          variant="folder" 
          title="Tempat sampah kosong" 
          description="Tidak ada file atau folder yang dihapus." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="card p-4 hover:border-slate-300 transition-colors group flex flex-col justify-between h-32">
              <div className="flex items-start gap-3 overflow-hidden">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.isFolder ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>
                  {item.isFolder ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5" title={item.originalPath}>Dari: {item.originalPath}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(item.deletedAt).toLocaleDateString()} • {formatFileSize(item.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <button onClick={() => handleRestore(item.id)} className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors">
                  <ArrowUturnLeftIcon className="w-3.5 h-3.5" />
                  Pulihkan
                </button>
                <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
