import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { formatRelativeDate } from '../utils/formatDate'

export default function FolderCard({ folder, onDelete, onRename }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleFolderClick = (e) => {
    if (menuOpen) return
    const encodedPath = encodeURIComponent(folder.path)
    navigate(`/folder${folder.path}`)
  }

  const handleMenuAction = (action) => {
    setMenuOpen(false)
    switch (action) {
      case 'rename':
        onRename?.(folder)
        break
      case 'delete':
        onDelete?.(folder)
        break
    }
  }

  return (
    <div
      className="card glass flex items-center gap-3.5 px-4 py-3.5 cursor-pointer animate-fade-in group"
      onClick={handleFolderClick}
    >
      {/* Folder icon */}
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-200/50 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
        <FolderIcon className="w-5 h-5 text-amber-600" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-[var(--color-text)] truncate tracking-wide">{folder.name}</p>
        <p className="text-[11px] font-medium text-[var(--color-text-light)] mt-0.5">{formatRelativeDate(folder.lastModified)}</p>
      </div>

      <div className="flex items-center gap-1">
        {/* Menu button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-background)] transition-colors text-[var(--color-muted)] group-hover:text-[var(--color-text-light)] opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label={`Menu untuk ${folder.name}`}
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-10 w-44 bg-white/70 backdrop-blur-3xl rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/60 z-30 animate-fade-in p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleMenuAction('rename')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-[13px] font-bold transition-all duration-200 group/btn text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-sm border border-white/50 bg-amber-100/50 text-amber-600 group-hover/btn:scale-110">
                    <PencilIcon className="w-[18px] h-[18px]" />
                  </div>
                  Rename
                </button>
                <div className="h-px bg-slate-200/80 my-0.5 mx-2" />
                <button
                  onClick={() => handleMenuAction('delete')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-[13px] font-bold transition-all duration-200 group/btn text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-sm border border-white/50 bg-red-100/50 text-red-600 group-hover/btn:scale-110">
                    <TrashIcon className="w-[18px] h-[18px]" />
                  </div>
                  Hapus
                </button>
              </div>
            </div>
          )}
        </div>

        <ChevronRightIcon className="w-4 h-4 text-[var(--color-muted)] group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  )
}
