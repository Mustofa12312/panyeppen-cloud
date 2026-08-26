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
              className="absolute right-0 top-10 w-40 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-[var(--color-glass-border)] z-30 overflow-hidden animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                <button
                  onClick={() => handleMenuAction('rename')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
                >
                  <PencilIcon className="w-4 h-4 text-[var(--color-muted)]" />
                  Rename
                </button>
                <div className="h-px bg-[var(--color-border)] my-1 opacity-50" />
                <button
                  onClick={() => handleMenuAction('delete')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--color-danger)] hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="w-4 h-4 text-[var(--color-danger)]" />
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
