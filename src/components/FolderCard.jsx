import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  ShareIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { formatRelativeDate } from '../utils/formatDate'

export default function FolderCard({ folder, onDelete, onRename, onMove, onShare, selected, onSelect, onDropItem }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const navigate = useNavigate()

  const handleFolderClick = (e) => {
    if (menuOpen) return
    if (e.metaKey || e.ctrlKey) {
      toggleSelect(e)
    } else {
      navigate(`/folder${folder.path}`)
    }
  }

  const handleMenuAction = (action) => {
    setMenuOpen(false)
    switch (action) {
      case 'rename':
        onRename?.(folder)
        break
      case 'move':
        onMove?.(folder)
        break
      case 'delete':
        onDelete?.(folder)
        break
      case 'share':
        onShare?.(folder)
        break
    }
  }

  const toggleSelect = (e) => {
    e.stopPropagation()
    onSelect?.(folder)
  }

  // Drag and Drop Logic
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    try {
      const data = e.dataTransfer.getData('application/json')
      if (data) {
        const item = JSON.parse(data)
        if (item.path !== folder.path && onDropItem) {
          onDropItem(item, folder.path)
        }
      }
    } catch (err) {
      // Ignored - probably external files dropped
    }
  }

  return (
    <div
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(folder))
      }}
      className={`card glass flex items-center gap-3.5 px-4 py-3.5 cursor-pointer animate-fade-in group transition-all duration-200 relative ${selected ? 'ring-2 ring-[var(--color-primary-500)] bg-[var(--color-primary-50)]' : isDragOver ? 'ring-2 ring-amber-400 bg-amber-50' : 'hover:border-[var(--color-primary-300)]'}`}
      onClick={handleFolderClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Selection overlay */}
      <div 
        onClick={toggleSelect}
        className={`absolute -top-2 -left-2 z-10 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center cursor-pointer transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} border`}
      >
        {selected ? (
          <CheckCircleSolid className="w-6 h-6 text-[var(--color-primary-500)]" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-slate-400" />
        )}
      </div>

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
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${menuOpen ? 'bg-[var(--color-background)] text-[var(--color-text-light)] opacity-100' : 'text-[var(--color-muted)] hover:bg-[var(--color-background)] group-hover:text-[var(--color-text-light)] opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
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
                <MenuBtn icon={<PencilIcon className="w-[18px] h-[18px]" />} iconColor="text-amber-600" iconBg="bg-amber-100/50" label="Rename" onClick={() => handleMenuAction('rename')} />
                <MenuBtn icon={<ArrowRightOnRectangleIcon className="w-[18px] h-[18px]" />} iconColor="text-teal-600" iconBg="bg-teal-100/50" label="Pindah" onClick={() => handleMenuAction('move')} />
                <MenuBtn icon={<ShareIcon className="w-[18px] h-[18px]" />} iconColor="text-purple-600" iconBg="bg-purple-100/50" label="Bagikan" onClick={() => handleMenuAction('share')} />
                <div className="h-px bg-slate-200/80 my-0.5 mx-2" />
                <MenuBtn icon={<TrashIcon className="w-[18px] h-[18px]" />} iconColor="text-red-600" iconBg="bg-red-100/50" label="Hapus" onClick={() => handleMenuAction('delete')} danger />
              </div>
            </div>
          )}
        </div>

        <ChevronRightIcon className="w-4 h-4 text-[var(--color-muted)] group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  )
}

function MenuBtn({ icon, iconColor, iconBg, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-[13px] font-bold transition-all duration-200 group/btn ${
        danger
          ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-sm border border-white/50 ${iconBg} ${iconColor} group-hover/btn:scale-110`}>
        {icon}
      </div>
      {label}
    </button>
  )
}
