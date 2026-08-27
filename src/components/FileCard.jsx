import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  EyeIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import FilePreviewModal from './FilePreviewModal'
import { formatFileSize } from '../utils/formatFileSize'
import { formatRelativeDate } from '../utils/formatDate'
import { getFileType } from '../utils/fileTypes'

function FileIcon({ filename, size = 'md' }) {
  const type = getFileType(filename)
  const dim = size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
  const textSize = size === 'lg' ? 'text-[0.5rem]' : 'text-[0.5rem]'

  return (
    <div
      className={`${dim} rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${textSize} uppercase tracking-widest shadow-sm group-hover:scale-105 transition-transform duration-300 border`}
      style={{ backgroundColor: type.bg, color: type.color, borderColor: `${type.color}30` }}
    >
      {type.label.slice(0, 3)}
    </div>
  )
}

export default function FileCard({ file, onDelete, onRename, onDownload, selected, onSelect, onMove, onShare }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const menuRef = useRef(null)

  const handleMenuAction = (action) => {
    setMenuOpen(false)
    switch (action) {
      case 'open':
        setShowPreview(true)
        break
      case 'download':
        onDownload?.(file)
        break
      case 'rename':
        onRename?.(file)
        break
      case 'move':
        onMove?.(file)
        break
      case 'delete':
        onDelete?.(file)
        break
      case 'share':
        onShare?.(file)
        break
      default:
        break
    }
  }

  const handleBlur = (e) => {
    if (!menuRef.current?.contains(e.relatedTarget)) {
      setMenuOpen(false)
    }
  }

  const toggleSelect = (e) => {
    e.stopPropagation()
    onSelect?.(file)
  }

  return (
    <>
      <div 
        draggable="true"
        onDragStart={(e) => {
          e.dataTransfer.setData('application/json', JSON.stringify(file))
        }}
        className={`card glass flex items-center gap-3.5 px-4 py-3.5 animate-fade-in cursor-pointer group transition-all duration-200 relative ${selected ? 'ring-2 ring-[var(--color-primary-500)] bg-[var(--color-primary-50)]' : 'hover:border-[var(--color-primary-300)]'}`}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey) {
            toggleSelect(e)
          } else {
            setShowPreview(true)
          }
        }}
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

        <FileIcon filename={file.name} />

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[var(--color-text)] truncate tracking-wide">{file.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-medium text-[var(--color-text-light)]">{formatFileSize(file.size)}</span>
            <span className="text-[var(--color-border)] text-[10px]">●</span>
            <span className="text-[11px] font-medium text-[var(--color-text-light)]">{formatRelativeDate(file.lastModified)}</span>
          </div>
        </div>

        {/* Menu button */}
        <div className="relative" ref={menuRef} onBlur={handleBlur} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${menuOpen ? 'bg-[var(--color-background)] text-[var(--color-text-light)] opacity-100' : 'text-[var(--color-muted)] hover:bg-[var(--color-background)] group-hover:text-[var(--color-text-light)] opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
            aria-label={`Menu untuk ${file.name}`}
            aria-expanded={menuOpen}
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-56 bg-white/70 backdrop-blur-3xl rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/60 z-30 animate-fade-in p-2">
              <div className="flex flex-col gap-1">
                <MenuBtn icon={<EyeIcon className="w-[18px] h-[18px]" />} iconColor="text-blue-600" iconBg="bg-blue-100/50" label="Buka / Preview" onClick={() => handleMenuAction('open')} />
                <MenuBtn icon={<ArrowDownTrayIcon className="w-[18px] h-[18px]" />} iconColor="text-emerald-600" iconBg="bg-emerald-100/50" label="Download" onClick={() => handleMenuAction('download')} />
                <MenuBtn icon={<PencilIcon className="w-[18px] h-[18px]" />} iconColor="text-amber-600" iconBg="bg-amber-100/50" label="Ganti Nama" onClick={() => handleMenuAction('rename')} />
                <MenuBtn icon={<ArrowRightOnRectangleIcon className="w-[18px] h-[18px]" />} iconColor="text-teal-600" iconBg="bg-teal-100/50" label="Pindah" onClick={() => handleMenuAction('move')} />
                <MenuBtn icon={<ShareIcon className="w-[18px] h-[18px]" />} iconColor="text-purple-600" iconBg="bg-purple-100/50" label="Bagikan" onClick={() => handleMenuAction('share')} />
                <div className="h-px bg-slate-200/80 my-0.5 mx-2" />
                <MenuBtn icon={<TrashIcon className="w-[18px] h-[18px]" />} iconColor="text-red-600" iconBg="bg-red-100/50" label="Hapus" onClick={() => handleMenuAction('delete')} danger />
              </div>
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <FilePreviewModal
          file={file}
          onClose={() => setShowPreview(false)}
          onDownload={(f) => {
            setShowPreview(false)
            onDownload?.(f)
          }}
        />
      )}
    </>
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

export { FileIcon }
