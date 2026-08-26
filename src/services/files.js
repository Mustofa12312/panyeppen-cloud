import axios from 'axios'
import { api } from './api'

const BASE_URL = '/nextcloud'

/**
 * Helper: dapatkan WebDAV path untuk user
 */
function davPath(username, path = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `/remote.php/dav/files/${username}${cleanPath}`
}

/**
 * Helper: dapatkan Authorization header dari session
 */
function getAuthHeader() {
  const token = sessionStorage.getItem('nc_token')
  return token ? `Basic ${token}` : ''
}

/**
 * Helper: dapatkan username dari session
 */
function getUsername() {
  const raw = sessionStorage.getItem('nc_user')
  if (!raw) return ''
  try {
    return JSON.parse(raw).id || ''
  } catch {
    return ''
  }
}

/**
 * Parse WebDAV PROPFIND response menjadi array file/folder
 */
function parseWebDAVFiles(xmlString, username) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')
  const responses = doc.querySelectorAll('response')

  const items = []
  const userPath = `/remote.php/dav/files/${username}`

  responses.forEach((res, index) => {
    if (index === 0) return // skip root entry

    const hrefEl = res.querySelector('href')
    const href = hrefEl?.textContent || ''

    // Decode URL-encoded characters
    const decodedHref = decodeURIComponent(href)
    const relativePath = decodedHref.replace(userPath, '') || '/'

    const nameSegments = relativePath.split('/').filter(Boolean)
    const name = nameSegments[nameSegments.length - 1] || ''

    const isCollection = !!res.querySelector('collection')
    const contentLength = res.querySelector('getcontentlength')?.textContent
    const lastModified = res.querySelector('getlastmodified')?.textContent
    const contentType = res.querySelector('getcontenttype')?.textContent || ''
    const etag = res.querySelector('getetag')?.textContent || ''

    if (name) {
      items.push({
        id: etag || href,
        name,
        path: relativePath,
        href,
        isFolder: isCollection,
        size: contentLength ? parseInt(contentLength) : 0,
        lastModified: lastModified ? new Date(lastModified) : new Date(),
        contentType,
        etag,
      })
    }
  })

  return items
}

/**
 * Daftar file dan folder di path tertentu
 * @param {string} path - path relatif dari root user
 */
export async function list(path = '/') {
  const username = getUsername() || 'testuser'
  const auth = getAuthHeader()

  // MOCK DATA: Bypassing server connection for UI testing
  console.log("Mocking file list for path:", path)
  
  // Fake delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const mockItems = [
    {
      id: 'mock-folder-1',
      name: 'Dokumen',
      path: `${path === '/' ? '' : path}/Dokumen`,
      href: `/remote.php/dav/files/${username}${path === '/' ? '' : path}/Dokumen`,
      isFolder: true,
      size: 0,
      lastModified: new Date(Date.now() - 86400000 * 2), // 2 days ago
      contentType: '',
      etag: 'mock-etag-f1',
    },
    {
      id: 'mock-folder-2',
      name: 'Foto',
      path: `${path === '/' ? '' : path}/Foto`,
      href: `/remote.php/dav/files/${username}${path === '/' ? '' : path}/Foto`,
      isFolder: true,
      size: 0,
      lastModified: new Date(Date.now() - 86400000 * 5), // 5 days ago
      contentType: '',
      etag: 'mock-etag-f2',
    },
    {
      id: 'mock-file-1',
      name: 'Laporan_Keuangan.pdf',
      path: `${path === '/' ? '' : path}/Laporan_Keuangan.pdf`,
      href: `/remote.php/dav/files/${username}${path === '/' ? '' : path}/Laporan_Keuangan.pdf`,
      isFolder: false,
      size: 2500000,
      lastModified: new Date(), // Just now
      contentType: 'application/pdf',
      etag: 'mock-etag-1',
    },
    {
      id: 'mock-file-2',
      name: 'Data_Santri.xlsx',
      path: `${path === '/' ? '' : path}/Data_Santri.xlsx`,
      href: `/remote.php/dav/files/${username}${path === '/' ? '' : path}/Data_Santri.xlsx`,
      isFolder: false,
      size: 850000,
      lastModified: new Date(Date.now() - 3600000), // 1 hr ago
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      etag: 'mock-etag-2',
    }
  ]
  
  return mockItems

  /* Original code (commented out)
  const response = await axios.request({
    method: 'PROPFIND',
    url: `${BASE_URL}${davPath(username, path)}`,
    headers: {
      Authorization: auth,
      Depth: '1',
      'Content-Type': 'application/xml',
    },
    data: `<?xml version="1.0" encoding="utf-8"?>
      <D:propfind xmlns:D="DAV:">
        <D:prop>
          <D:displayname/>
          <D:resourcetype/>
          <D:getcontentlength/>
          <D:getlastmodified/>
          <D:getcontenttype/>
          <D:getetag/>
        </D:prop>
      </D:propfind>`,
  })

  return parseWebDAVFiles(response.data, username)
  */
}

/**
 * Upload file ke path tertentu
 * @param {string} path - path folder tujuan
 * @param {File} file - file object dari input
 * @param {Function} onProgress - callback progress (0-100)
 * @param {AbortSignal} signal - untuk cancel upload
 */
export async function upload(path = '/', file, onProgress, signal) {
  const username = getUsername()
  const auth = getAuthHeader()
  const cleanPath = path.endsWith('/') ? path : `${path}/`
  const targetPath = `${davPath(username, cleanPath)}${file.name}`

  const response = await axios.put(
    `${BASE_URL}${targetPath}`,
    file,
    {
      headers: {
        Authorization: auth,
        'Content-Type': file.type || 'application/octet-stream',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      },
      signal,
    }
  )

  return response
}

/**
 * Download file
 * @param {string} path - path file
 * @param {string} filename - nama file untuk download
 */
export async function download(path, filename) {
  const username = getUsername()
  const auth = getAuthHeader()

  const response = await axios.get(
    `${BASE_URL}${davPath(username, path)}`,
    {
      headers: { Authorization: auth },
      responseType: 'blob',
    }
  )

  // Trigger download di browser
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/**
 * Get download URL untuk preview (streaming)
 * @param {string} path - path file
 */
export function getPreviewUrl(path) {
  const username = getUsername()
  const token = sessionStorage.getItem('nc_token')
  // Gunakan Nextcloud preview endpoint
  return `${BASE_URL}${davPath(username, path)}`
}

/**
 * Hapus file atau folder
 * @param {string} path - path file/folder
 */
export async function deleteItem(path) {
  const username = getUsername()
  const auth = getAuthHeader()

  await axios.delete(
    `${BASE_URL}${davPath(username, path)}`,
    {
      headers: { Authorization: auth },
    }
  )
}

/**
 * Rename file atau folder (menggunakan WebDAV MOVE)
 * @param {string} oldPath - path lama
 * @param {string} newName - nama baru
 */
export async function rename(oldPath, newName) {
  const username = getUsername()
  const auth = getAuthHeader()

  // Hitung parent folder
  const segments = oldPath.split('/').filter(Boolean)
  segments.pop() // hapus nama lama
  const parentPath = segments.length > 0 ? `/${segments.join('/')}` : '/'
  const newPath = `${parentPath}/${newName}`

  const destination = `${window.location.origin}${BASE_URL}${davPath(username, newPath)}`

  await axios.request({
    method: 'MOVE',
    url: `${BASE_URL}${davPath(username, oldPath)}`,
    headers: {
      Authorization: auth,
      Destination: destination,
      Overwrite: 'F',
    },
  })

  return newPath
}

/**
 * Buat folder baru
 * @param {string} parentPath - path parent folder
 * @param {string} folderName - nama folder baru
 */
export async function createFolder(parentPath = '/', folderName) {
  const username = getUsername()
  const auth = getAuthHeader()
  const cleanParent = parentPath.endsWith('/') ? parentPath : `${parentPath}/`
  const newFolderPath = `${cleanParent}${folderName}`

  await axios.request({
    method: 'MKCOL',
    url: `${BASE_URL}${davPath(username, newFolderPath)}`,
    headers: { Authorization: auth },
  })

  return newFolderPath
}

/**
 * Cari file dan folder
 * @param {string} query - kata kunci pencarian
 * @param {string} path - path folder untuk pencarian (opsional)
 */
export async function search(query, path = '/') {
  const username = getUsername()
  const auth = getAuthHeader()

  // Gunakan Nextcloud Search API (SEARCH WebDAV)
  try {
    const response = await axios.request({
      method: 'SEARCH',
      url: `${BASE_URL}/remote.php/dav/`,
      headers: {
        Authorization: auth,
        'Content-Type': 'application/xml',
      },
      data: `<?xml version="1.0" encoding="utf-8"?>
        <d:searchrequest xmlns:d="DAV:" xmlns:nc="http://nextcloud.org/ns">
          <d:basicsearch>
            <d:select>
              <d:prop>
                <d:displayname/>
                <d:resourcetype/>
                <d:getcontentlength/>
                <d:getlastmodified/>
                <d:getcontenttype/>
                <d:getetag/>
              </d:prop>
            </d:select>
            <d:from>
              <d:scope>
                <d:href>/remote.php/dav/files/${username}${path}</d:href>
                <d:depth>infinity</d:depth>
              </d:scope>
            </d:from>
            <d:where>
              <d:like>
                <d:prop><d:displayname/></d:prop>
                <d:literal>%${query}%</d:literal>
              </d:like>
            </d:where>
            <d:limit>
              <d:nresults>50</d:nresults>
            </d:limit>
          </d:basicsearch>
        </d:searchrequest>`,
    })

    return parseWebDAVFiles(response.data, username)
  } catch {
    // Fallback: list semua dan filter client-side
    const items = await list(path)
    return items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    )
  }
}

/**
 * Get file info
 */
export async function getFileInfo(path) {
  const username = getUsername()
  const auth = getAuthHeader()

  const response = await axios.request({
    method: 'PROPFIND',
    url: `${BASE_URL}${davPath(username, path)}`,
    headers: {
      Authorization: auth,
      Depth: '0',
      'Content-Type': 'application/xml',
    },
    data: `<?xml version="1.0" encoding="utf-8"?>
      <D:propfind xmlns:D="DAV:">
        <D:allprop/>
      </D:propfind>`,
  })

  const items = parseWebDAVFiles(response.data, username)
  // PROPFIND Depth:0 includes the folder itself as first (and only) item
  const parser = new DOMParser()
  const doc = parser.parseFromString(response.data, 'application/xml')
  const res = doc.querySelector('response')
  if (!res) return null

  const name = decodeURIComponent(path.split('/').filter(Boolean).pop() || '')
  const isCollection = !!res.querySelector('collection')
  const contentLength = res.querySelector('getcontentlength')?.textContent
  const lastModified = res.querySelector('getlastmodified')?.textContent
  const contentType = res.querySelector('getcontenttype')?.textContent || ''

  return {
    name,
    path,
    isFolder: isCollection,
    size: contentLength ? parseInt(contentLength) : 0,
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    contentType,
  }
}
