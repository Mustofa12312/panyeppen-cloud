/**
 * Format tanggal ke tampilan relatif (e.g. "2 jam lalu", "kemarin")
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeDate(date) {
  if (!date) return ''

  const now = new Date()
  const target = new Date(date)
  const diffMs = now - target
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  if (diffHour < 24) return `${diffHour} jam lalu`
  if (diffDay === 1) return 'Kemarin'
  if (diffDay < 7) return `${diffDay} hari lalu`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu lalu`
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} bulan lalu`

  return target.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format tanggal ke format ID lengkap
 */
export function formatFullDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
