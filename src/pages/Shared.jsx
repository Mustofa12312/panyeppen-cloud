import { ShareIcon } from '@heroicons/react/24/outline'

export default function Shared() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="pt-1">
        <h2 className="text-xl font-bold text-[#0f172a]">Shared</h2>
        <p className="text-xs text-[#94a3b8] mt-0.5">File yang dibagikan</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-20 h-20 rounded-3xl bg-[#f8fafc] flex items-center justify-center mb-5">
          <ShareIcon className="w-10 h-10 text-[#cbd5e1]" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-bold text-[#0f172a] mb-1.5">Segera Hadir</h3>
        <p className="text-sm text-[#64748b] text-center max-w-xs">
          Fitur berbagi file akan tersedia di update berikutnya (Phase 4).
        </p>
      </div>
    </div>
  )
}
