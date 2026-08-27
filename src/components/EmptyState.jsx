import {
  FolderOpenIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'

const VARIANTS = {
  folder: {
    icon: FolderOpenIcon,
    color: '#f59e0b',
    bg: '#fffbeb',
    title: 'Folder masih kosong',
    description: 'Belum ada file atau folder di sini',
  },
  files: {
    icon: DocumentIcon,
    color: '#64748b',
    bg: '#f8fafc',
    title: 'Belum ada file',
    description: 'Upload file pertama kamu di sini',
  },
  search: {
    icon: MagnifyingGlassIcon,
    color: '#16a34a',
    bg: '#f0fdf4',
    title: 'Tidak ditemukan',
    description: 'Coba kata kunci yang berbeda',
  },
  upload: {
    icon: ArrowUpTrayIcon,
    color: '#16a34a',
    bg: '#f0fdf4',
    title: 'Belum ada upload',
    description: 'Pilih file untuk diupload',
  },
}

export default function EmptyState({
  variant = 'files',
  title,
  description,
  action,
  actionLabel,
}) {
  const v = VARIANTS[variant] || VARIANTS.files
  const IconComponent = v.icon

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
        style={{ backgroundColor: v.bg }}
      >
        <IconComponent className="w-10 h-10" style={{ color: v.color }} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-bold text-[#0f172a] mb-1.5 text-center">
        {title || v.title}
      </h3>
      <p className="text-sm text-[#64748b] text-center max-w-xs">
        {description || v.description}
      </p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="mt-6 text-sm px-6 h-11 rounded-xl font-bold text-white transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            boxShadow: '0 4px 14px 0 rgba(20, 184, 166, 0.3)',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
