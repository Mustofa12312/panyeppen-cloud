/**
 * Mendapatkan ekstensi file dari nama file
 */
export function getFileExtension(filename) {
  if (!filename) return ''
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * Mendapatkan ikon dan warna berdasarkan tipe file
 */
export function getFileType(filename) {
  const ext = getFileExtension(filename)

  const types = {
    // Documents
    pdf: { icon: 'pdf', color: '#ef4444', bg: '#fef2f2', label: 'PDF' },
    doc: { icon: 'word', color: '#2563eb', bg: '#eff6ff', label: 'Word' },
    docx: { icon: 'word', color: '#2563eb', bg: '#eff6ff', label: 'Word' },
    xls: { icon: 'excel', color: '#16a34a', bg: '#f0fdf4', label: 'Excel' },
    xlsx: { icon: 'excel', color: '#16a34a', bg: '#f0fdf4', label: 'Excel' },
    ppt: { icon: 'ppt', color: '#ea580c', bg: '#fff7ed', label: 'PowerPoint' },
    pptx: { icon: 'ppt', color: '#ea580c', bg: '#fff7ed', label: 'PowerPoint' },
    txt: { icon: 'text', color: '#64748b', bg: '#f8fafc', label: 'Text' },

    // Images
    jpg: { icon: 'image', color: '#7c3aed', bg: '#f5f3ff', label: 'Gambar' },
    jpeg: { icon: 'image', color: '#7c3aed', bg: '#f5f3ff', label: 'Gambar' },
    png: { icon: 'image', color: '#7c3aed', bg: '#f5f3ff', label: 'Gambar' },
    gif: { icon: 'image', color: '#7c3aed', bg: '#f5f3ff', label: 'Gambar' },
    webp: { icon: 'image', color: '#7c3aed', bg: '#f5f3ff', label: 'Gambar' },
    svg: { icon: 'image', color: '#7c3aed', bg: '#f5f3ff', label: 'SVG' },

    // Video
    mp4: { icon: 'video', color: '#0891b2', bg: '#ecfeff', label: 'Video' },
    avi: { icon: 'video', color: '#0891b2', bg: '#ecfeff', label: 'Video' },
    mov: { icon: 'video', color: '#0891b2', bg: '#ecfeff', label: 'Video' },
    mkv: { icon: 'video', color: '#0891b2', bg: '#ecfeff', label: 'Video' },

    // Audio
    mp3: { icon: 'audio', color: '#9333ea', bg: '#faf5ff', label: 'Audio' },
    wav: { icon: 'audio', color: '#9333ea', bg: '#faf5ff', label: 'Audio' },
    flac: { icon: 'audio', color: '#9333ea', bg: '#faf5ff', label: 'Audio' },

    // Archives
    zip: { icon: 'archive', color: '#b45309', bg: '#fffbeb', label: 'ZIP' },
    rar: { icon: 'archive', color: '#b45309', bg: '#fffbeb', label: 'RAR' },
    tar: { icon: 'archive', color: '#b45309', bg: '#fffbeb', label: 'TAR' },
    gz: { icon: 'archive', color: '#b45309', bg: '#fffbeb', label: 'GZ' },
  }

  return types[ext] || { icon: 'file', color: '#64748b', bg: '#f8fafc', label: 'File' }
}

/**
 * Cek apakah file bisa dipreview di browser
 */
export function canPreview(filename) {
  const previewable = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'txt', 'svg']
  return previewable.includes(getFileExtension(filename))
}

/**
 * Mendapatkan MIME type dari ekstensi
 */
export function getMimeType(filename) {
  const ext = getFileExtension(filename)
  const mimes = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
  }
  return mimes[ext] || 'application/octet-stream'
}
