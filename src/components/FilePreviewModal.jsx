import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { canPreview, getMimeType } from '../utils/fileTypes'
import { getPreviewUrl } from '../services/files'

export default function FilePreviewModal({ file, onClose, onDownload }) {
  const isPreviewable = canPreview(file.name)
  const previewUrl = getPreviewUrl(file.path)
  const mimeType = getMimeType(file.name)

  const isImage = mimeType.startsWith('image/')
  const isPdf = mimeType === 'application/pdf'
  const isText = mimeType === 'text/plain'
  const isVideo = mimeType.startsWith('video/')
  const isAudio = mimeType.startsWith('audio/')

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 bg-black/50 backdrop-blur-md">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-white text-sm font-semibold truncate">{file.name}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onDownload(file)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Download"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Tutup"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
        {!isPreviewable ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-white/50 uppercase">
                {file.name.split('.').pop()}
              </span>
            </div>
            <p className="text-white font-medium mb-1">File tidak dapat dipreview</p>
            <p className="text-white/60 text-sm mb-6">Format file ini tidak didukung untuk pratinjau.</p>
            <button
              onClick={() => onDownload(file)}
              className="btn btn-primary"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Download File
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isImage && (
              <img
                src={previewUrl}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
            
            {isPdf && (
              <iframe
                src={previewUrl}
                title={file.name}
                className="w-full h-full rounded-lg bg-white"
              />
            )}
            
            {(isVideo || isAudio) && (
              <video
                src={previewUrl}
                controls
                className="max-w-full max-h-full rounded-lg"
              />
            )}

            {isText && (
              <iframe
                src={previewUrl}
                title={file.name}
                className="w-full h-full rounded-lg bg-white p-4"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
