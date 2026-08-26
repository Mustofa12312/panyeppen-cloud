/**
 * Format bytes ke tampilan yang mudah dibaca
 * @param {number} bytes
 * @param {number} decimals
 * @returns {string}
 */
export function formatFileSize(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * Format bytes ke persen dari total
 */
export function formatStoragePercent(used, total) {
  if (!total || total === 0) return 0
  return Math.round((used / total) * 100)
}
