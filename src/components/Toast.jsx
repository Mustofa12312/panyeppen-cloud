import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const icons = {
  success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
  error: <ExclamationCircleIcon className="w-5 h-5 text-red-500" />,
  info: <InformationCircleIcon className="w-5 h-5 text-blue-500" />
}

export default function Toast({ id, type = 'info', message, onClose }) {
  return (
    <div className="flex items-start gap-3 min-w-[280px] max-w-sm glass bg-white/90 backdrop-blur-xl border-white/40 shadow-xl rounded-2xl p-4 animate-fade-in pointer-events-auto">
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)]">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 rounded-full p-1 hover:bg-[var(--color-background)] transition-colors"
      >
        <XMarkIcon className="w-4 h-4 text-[var(--color-muted)]" />
      </button>
    </div>
  )
}
