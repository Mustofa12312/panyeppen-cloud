import { useState, useEffect } from 'react'
import { LinkIcon, LockClosedIcon, ClockIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { getShares, revokeShare } from '../services/files'
import { useToast } from '../context/ToastContext'
import EmptyState from '../components/EmptyState'

export default function Shared() {
  const [shares, setShares] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const [copiedId, setCopiedId] = useState(null)

  const loadShares = async () => {
    setLoading(true)
    try {
      const data = await getShares()
      setShares(data)
    } catch {
      showToast('Gagal memuat daftar tautan publik', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadShares()
  }, [])

  const handleCopy = (id) => {
    const fullUrl = `${window.location.origin}/shared/${id}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    showToast('Tautan tersalin!', 'success')
  }

  const handleRevoke = async (id) => {
    if (!window.confirm('Yakin ingin mencabut tautan publik ini?')) return
    try {
      await revokeShare(id)
      setShares(prev => prev.filter(s => s.id !== id))
      showToast('Tautan berhasil dicabut', 'success')
    } catch {
      showToast('Gagal mencabut tautan', 'error')
    }
  }

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="pt-1">
        <h2 className="text-xl font-bold text-slate-800">File Dibagikan</h2>
        <p className="text-xs text-slate-500 mt-0.5">Kelola tautan publik yang aktif</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : shares.length === 0 ? (
        <EmptyState 
          variant="search" 
          title="Belum ada tautan dibagikan" 
          description="Anda belum membuat tautan publik untuk file apapun." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shares.map(share => {
            const isExpired = share.expires_at && new Date() > new Date(share.expires_at)
            
            return (
              <div key={share.id} className="card p-5 hover:border-slate-300 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {share.has_password === 1 && (
                        <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 tooltip" data-tip="Dilindungi Sandi">
                          <LockClosedIcon className="w-4 h-4" />
                        </div>
                      )}
                      {share.expires_at && (
                        <div className={`p-1.5 rounded-lg ${isExpired ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'} tooltip`} data-tip={isExpired ? 'Kadaluarsa' : 'Berbatas Waktu'}>
                          <ClockIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="font-bold text-slate-800 truncate mb-1" title={share.file_path}>
                    {share.file_path.split('/').pop()}
                  </p>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 truncate">Path: {share.file_path}</p>
                    <p className="text-xs text-slate-500">Dibuat: {new Date(share.created_at).toLocaleDateString()}</p>
                    {share.expires_at && (
                      <p className={`text-xs ${isExpired ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                        Berlaku s/d: {new Date(share.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handleCopy(share.id)} 
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    {copiedId === share.id ? 'Tersalin' : 'Salin'}
                  </button>
                  <button 
                    onClick={() => handleRevoke(share.id)} 
                    className="flex items-center justify-center gap-1.5 h-9 px-4 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Cabut
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
