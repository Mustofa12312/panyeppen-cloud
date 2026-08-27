import { formatFileSize, formatStoragePercent } from '../utils/formatFileSize'
import { CloudIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function StorageCard({ used = 0, total = 0 }) {
  const percent = formatStoragePercent(used, total)
  const isNearFull = percent > 80
  const isCritical = percent > 95

  return (
    <div className="card relative overflow-hidden p-5 border border-white/20 shadow-xl"
         style={{
           background: 'linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%)',
           color: 'white'
         }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-[var(--color-primary-300)] opacity-20 rounded-full blur-xl"></div>
      
      <div className="relative z-10 flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <SparklesIcon className="w-3.5 h-3.5 text-teal-100" />
            <p className="text-[10px] font-bold text-teal-100 uppercase tracking-[0.15em]">
              Penyimpanan Cloud
            </p>
          </div>
          <p className="text-3xl font-extrabold tracking-tight">
            {formatFileSize(used)}
          </p>
          <p className="text-sm text-teal-100 mt-1 font-medium opacity-90">
            {total > 0 ? `dari ${formatFileSize(total)}` : 'Kuota belum ditentukan'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-inner">
          <CloudIcon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 h-2.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{
            width: `${Math.min(percent, 100)}%`,
            backgroundColor: isCritical ? '#ef4444' : isNearFull ? '#f59e0b' : '#34d399',
            boxShadow: '0 0 10px rgba(255,255,255,0.3)'
          }}
        >
          {/* Shimmer effect inside progress bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-center mt-3">
        <p className="text-xs font-medium text-teal-100">
          {total > 0 ? `${formatFileSize(Math.max(total - used, 0))} tersisa` : 'Pemakaian saat ini'}
        </p>
        <p className="text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
          {total > 0 ? `${percent}%` : '---'}
        </p>
      </div>
    </div>
  )
}
