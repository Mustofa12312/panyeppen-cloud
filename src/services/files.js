import { api } from './api'

// 1. List files and folders
export async function list(path = '/') {
  const response = await api.get('/files', { params: { path } })
  
  // map string dates to Date objects
  return response.data.map(item => ({
    ...item,
    lastModified: new Date(item.lastModified)
  }))
}

// 2. Upload file
export async function upload(path = '/', file, onProgress, signal) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/files/upload', formData, {
    params: { path },
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percent)
      }
    },
    signal,
  })

  return response
}

// 3. Download file
export async function download(path, filename) {
  const response = await api.get('/files/download', {
    params: { path },
    responseType: 'blob',
  })

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// 4. Get Preview URL (Streaming)
export function getPreviewUrl(path) {
  const token = sessionStorage.getItem('nc_token')
  return `/api/files/preview?path=${encodeURIComponent(path)}&token=${token}`
}

// 5. Delete item
export async function deleteItem(path) {
  await api.delete('/files', { params: { path } })
}

// 6. Rename item
export async function rename(oldPath, newName) {
  const response = await api.put('/files/rename', { oldPath, newName })
  return response.data.path
}

// 7. Create Folder
export async function createFolder(parentPath = '/', folderName) {
  const response = await api.post('/files/folder', { path: parentPath, folderName })
  return response.data.path
}

// 8. Search
export async function search(query, path = '/') {
  const response = await api.get('/files/search', { params: { q: query, path } })
  
  return response.data.map(item => ({
    ...item,
    lastModified: new Date(item.lastModified)
  }))
}

// 9. Get Storage Info
export async function getStorageInfo() {
  const response = await api.get('/storage')
  return response.data
}

// 10. Generate Share Link
export async function createShareLink(path) {
  const response = await api.post('/shares', { path })
  return response.data // { shareId, url }
}

// 11. Download ZIP
export async function downloadZip(paths, filename = 'Download.zip') {
  const response = await api.post('/files/zip', { paths }, {
    responseType: 'blob'
  })

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
