import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { formatFileSize } from '../utils/formatFileSize'

/**
 * Komponen progress upload per-file
 */
export function UploadProgressItem({ file, progress, status, error, onCancel }) {
  const isSuccess = status === 'success'
  const isError = status === 'error'
  const isUploading = status === 'uploading'
  const isPending = status === 'pending'

  return (
    <div className="card px-4 py-3 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* File icon / status */}
        <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center flex-shrink-0">
          {isSuccess ? (
            <CheckCircleIcon className="w-6 h-6 text-[#16a34a]" />
          ) : isError ? (
            <ExclamationCircleIcon className="w-6 h-6 text-[#dc2626]" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-[#16a34a] border-t-transparent animate-spin-slow" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0f172a] truncate">{file.name}</p>
          <p className="text-xs text-[#94a3b8] mt-0.5">{formatFileSize(file.size)}</p>

          {/* Progress bar */}
          {(isUploading || isSuccess) && (
            <div className="mt-2">
              <div className="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${isSuccess ? 100 : progress}%`,
                    backgroundColor: isSuccess ? '#16a34a' : '#16a34a',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className={`text-xs font-medium ${isSuccess ? 'text-[#16a34a]' : 'text-[#64748b]'}`}>
                  {isSuccess ? '✓ Berhasil' : `${progress}%`}
                </p>
              </div>
            </div>
          )}

          {isError && (
            <p className="text-xs text-[#dc2626] mt-1">{error || 'Upload gagal'}</p>
          )}

          {isPending && (
            <p className="text-xs text-[#94a3b8] mt-1">Menunggu...</p>
          )}
        </div>

        {/* Cancel button */}
        {(isUploading || isPending) && onCancel && (
          <button
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] text-[#94a3b8] transition-colors flex-shrink-0"
            aria-label="Batalkan upload"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default UploadProgressItem
