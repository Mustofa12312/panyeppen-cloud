import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import SearchBar from '../components/SearchBar'
import FileCard from '../components/FileCard'
import FolderCard from '../components/FolderCard'
import EmptyState from '../components/EmptyState'
import { search as searchFiles, download } from '../services/files'

export default function Search() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = async (q) => {
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const items = await searchFiles(q.trim())
      setResults(items)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery)
    }
  }, [])

  const handleSearch = (q) => {
    setQuery(q)
    doSearch(q)
  }

  const handleDownload = async (file) => {
    try {
      await download(file.path, file.name)
    } catch {
      alert('Gagal download')
    }
  }

  const folders = results.filter((r) => r.isFolder)
  const files = results.filter((r) => !r.isFolder)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeftIcon className="w-5 h-5 text-[#64748b]" />
        </button>
        <div className="flex-1">
          <SearchBar
            placeholder="Cari file atau folder..."
            navigateToSearch={false}
            onSearch={handleSearch}
            value={query}
            onChange={setQuery}
            autoFocus={!initialQuery}
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : !searched ? (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-20 h-20 rounded-3xl bg-[#f0fdf4] flex items-center justify-center mb-5">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#16a34a" strokeWidth="1.5"/>
              <path d="M16.5 16.5L21 21" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-base font-bold text-[#0f172a] mb-1.5">Cari di Panyeppen Cloud</p>
          <p className="text-sm text-[#64748b] text-center">
            Ketik nama file atau folder yang ingin dicari
          </p>
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          variant="search"
          title={`Tidak ditemukan: "${query}"`}
          description="Coba kata kunci yang berbeda atau cari di folder lain"
        />
      ) : (
        <div className="space-y-4">
          <p className="section-title">
            {results.length} hasil untuk "{query}"
          </p>

          {folders.length > 0 && (
            <div>
              <p className="section-title">Folder</p>
              <div className="space-y-2">
                {folders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              <p className="section-title">File</p>
              <div className="space-y-2">
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
