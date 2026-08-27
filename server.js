import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import mime from 'mime-types'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import archiver from 'archiver'
import crypto from 'crypto'
import { getDb } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'panyeppen-super-secret-key'

// Configuration
const STORAGE_DIR = process.env.STORAGE_PATH || path.join(__dirname, 'storage')
console.log(`[INIT] Base Storage directory set to: ${STORAGE_DIR}`)

// Middleware
app.use(cors())
app.use(express.json())

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  // Support token from header or query param (for preview/download)
  const authHeader = req.headers['authorization']
  const token = (authHeader && authHeader.split(' ')[1]) || req.query.token

  if (!token) return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid atau sudah kadaluarsa.' })
    req.user = user // { id, username, displayName }
    next()
  })
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Note: req.user is populated by authenticateToken before multer runs
    const userStoragePath = path.join(STORAGE_DIR, req.user.username)
    const targetPath = req.query.path || '/'
    const fullPath = path.join(userStoragePath, targetPath)
    
    // Check path traversal
    const normalizedPath = path.normalize(targetPath).replace(/^(\.\.[\/\\])+/, '')
    const safePath = path.join(userStoragePath, normalizedPath)
    if (!safePath.startsWith(userStoragePath)) {
      return cb(new Error('Invalid path'))
    }
    
    fs.ensureDirSync(safePath)
    cb(null, safePath)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

// Security helper to prevent directory traversal per user
function getSafePath(username, reqPath) {
  const userStoragePath = path.join(STORAGE_DIR, username)
  fs.ensureDirSync(userStoragePath) // Ensure user's root exists

  const normalizedPath = path.normalize(reqPath || '/').replace(/^(\.\.[\/\\])+/, '')
  const safePath = path.join(userStoragePath, normalizedPath)
  
  if (!safePath.startsWith(userStoragePath)) {
    throw new Error('Invalid path')
  }
  return { safePath, relativePath: normalizedPath === '.' ? '/' : normalizedPath }
}

// ---------------------------------------------------------
// Auth API Endpoints
// ---------------------------------------------------------

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, displayName } = req.body
    if (!username || !password || !displayName) {
      return res.status(400).json({ error: 'Lengkapi semua data' })
    }

    const db = await getDb()
    const existing = await db.get('SELECT * FROM users WHERE username = ?', [username])
    if (existing) {
      return res.status(400).json({ error: 'Username sudah digunakan' })
    }

    const hash = await bcrypt.hash(password, 10)
    await db.run('INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)', [username, hash, displayName])
    
    res.json({ message: 'Registrasi berhasil' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Terjadi kesalahan server' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const db = await getDb()
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username])
    
    if (!user) return res.status(401).json({ error: 'Username atau password salah' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Username atau password salah' })

    const token = jwt.sign(
      { id: user.id, username: user.username, displayName: user.display_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.username,
        displayName: user.display_name,
        email: `${user.username}@panyeppen.local`
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Terjadi kesalahan server' })
  }
})

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({
    id: req.user.username,
    displayName: req.user.displayName,
    email: `${req.user.username}@panyeppen.local`
  })
})

// ---------------------------------------------------------
// File API Endpoints (Protected)
// ---------------------------------------------------------

// 1. List files and folders
app.get('/api/files', authenticateToken, async (req, res) => {
  try {
    const { safePath, relativePath } = getSafePath(req.user.username, req.query.path)
    
    if (!fs.existsSync(safePath)) {
      if (req.query.path === '/' || !req.query.path) return res.json([])
      return res.status(404).json({ error: 'Path not found' })
    }

    const items = await fs.readdir(safePath)
    const fileList = await Promise.all(items.map(async (itemName) => {
      const itemPath = path.join(safePath, itemName)
      const stats = await fs.stat(itemPath)
      const isFolder = stats.isDirectory()
      
      const itemRelativePath = path.join(relativePath, itemName).replace(/\\/g, '/')
      
      return {
        id: Buffer.from(itemRelativePath).toString('base64'),
        name: itemName,
        path: itemRelativePath.startsWith('/') ? itemRelativePath : `/${itemRelativePath}`,
        isFolder,
        size: stats.size,
        lastModified: stats.mtime,
        contentType: isFolder ? '' : mime.lookup(itemName) || 'application/octet-stream',
      }
    }))
    
    fileList.sort((a, b) => {
      if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name)
      return a.isFolder ? -1 : 1
    })

    res.json(fileList)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// 2. Upload file
app.post('/api/files/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  res.json({ message: 'File uploaded successfully', file: req.file.originalname })
})

// 3. Create folder
app.post('/api/files/folder', authenticateToken, async (req, res) => {
  try {
    const { path: reqPath, folderName } = req.body
    if (!folderName) return res.status(400).json({ error: 'Folder name required' })
    
    const { safePath, relativePath } = getSafePath(req.user.username, reqPath)
    const newFolderPath = path.join(safePath, folderName)
    
    await fs.ensureDir(newFolderPath)
    const finalRelativePath = path.join(relativePath, folderName).replace(/\\/g, '/')
    
    res.json({ message: 'Folder created', path: finalRelativePath.startsWith('/') ? finalRelativePath : `/${finalRelativePath}` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// 4. Rename file/folder
app.put('/api/files/rename', authenticateToken, async (req, res) => {
  try {
    const { oldPath, newName } = req.body
    if (!oldPath || !newName) return res.status(400).json({ error: 'oldPath and newName required' })
    
    const { safePath: oldSafePath } = getSafePath(req.user.username, oldPath)
    
    if (!fs.existsSync(oldSafePath)) {
      return res.status(404).json({ error: 'Original file not found' })
    }
    
    const parentDir = path.dirname(oldSafePath)
    const newSafePath = path.join(parentDir, newName)
    
    await fs.rename(oldSafePath, newSafePath)
    
    const userStoragePath = path.join(STORAGE_DIR, req.user.username)
    const newRelativePath = newSafePath.substring(userStoragePath.length).replace(/\\/g, '/') || '/'
    res.json({ message: 'Renamed successfully', path: newRelativePath })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// 5. Delete file/folder
app.delete('/api/files', authenticateToken, async (req, res) => {
  try {
    const { safePath } = getSafePath(req.user.username, req.query.path)
    const userStoragePath = path.join(STORAGE_DIR, req.user.username)
    
    if (safePath === userStoragePath) {
      return res.status(403).json({ error: 'Cannot delete root directory' })
    }
    
    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ error: 'File not found' })
    }
    
    await fs.remove(safePath)
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// 5b. Bulk Delete files/folders
app.post('/api/files/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const { paths } = req.body
    if (!paths || !Array.isArray(paths)) {
      return res.status(400).json({ error: 'Paths array required' })
    }
    
    const userStoragePath = path.join(STORAGE_DIR, req.user.username)
    let deletedCount = 0;

    for (const p of paths) {
      const { safePath } = getSafePath(req.user.username, p)
      if (safePath !== userStoragePath && fs.existsSync(safePath)) {
        await fs.remove(safePath)
        deletedCount++
      }
    }
    
    res.json({ message: `Deleted ${deletedCount} items successfully` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// 6. Download file
app.get('/api/files/download', authenticateToken, (req, res) => {
  try {
    const { safePath } = getSafePath(req.user.username, req.query.path)
    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ error: 'File not found' })
    }
    res.download(safePath)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// 7. Preview/Stream file
app.get('/api/files/preview', authenticateToken, (req, res) => {
  try {
    const { safePath } = getSafePath(req.user.username, req.query.path)
    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ error: 'File not found' })
    }
    res.sendFile(safePath)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// 8. Search (Recursive)
app.get('/api/files/search', authenticateToken, async (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase()
    const startPath = req.query.path || '/'
    const { safePath: searchRoot } = getSafePath(req.user.username, startPath)
    
    if (!query) return res.json([])
    if (!fs.existsSync(searchRoot)) return res.json([])
    
    const results = []
    const userStoragePath = path.join(STORAGE_DIR, req.user.username)
    
    async function scanDir(currentSafePath) {
      const items = await fs.readdir(currentSafePath)
      for (const itemName of items) {
        const itemPath = path.join(currentSafePath, itemName)
        const stats = await fs.stat(itemPath)
        const isFolder = stats.isDirectory()
        
        const itemRelativePath = itemPath.substring(userStoragePath.length).replace(/\\/g, '/') || '/'
        
        if (itemName.toLowerCase().includes(query)) {
          results.push({
            id: Buffer.from(itemRelativePath).toString('base64'),
            name: itemName,
            path: itemRelativePath,
            isFolder,
            size: stats.size,
            lastModified: stats.mtime,
            contentType: isFolder ? '' : mime.lookup(itemName) || 'application/octet-stream',
          })
        }
        
        if (results.length >= 50) return
        
        if (isFolder) {
          await scanDir(itemPath)
        }
      }
    }
    
    await scanDir(searchRoot)
    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// 9. Storage Quota
app.get('/api/storage', authenticateToken, async (req, res) => {
  try {
    let totalSize = 0;
    const userStoragePath = path.join(STORAGE_DIR, req.user.username)
    
    async function calculateSize(dirPath) {
      const items = await fs.readdir(dirPath);
      for (const itemName of items) {
        const itemPath = path.join(dirPath, itemName);
        const stats = await fs.stat(itemPath);
        if (stats.isDirectory()) {
          await calculateSize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    }
    
    if (fs.existsSync(userStoragePath)) {
      await calculateSize(userStoragePath);
    }
    
    res.json({
      used: totalSize,
      total: 50 * 1024 * 1024 * 1024 // 50GB limit
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
})

// 10. Generate Share Link (Public)
app.post('/api/shares', authenticateToken, async (req, res) => {
  try {
    const { path: filePath } = req.body
    if (!filePath) return res.status(400).json({ error: 'Path required' })

    // Verify file exists
    const { safePath } = getSafePath(req.user.username, filePath)
    if (!fs.existsSync(safePath)) return res.status(404).json({ error: 'File not found' })

    const db = await getDb()
    const shareId = crypto.randomUUID()
    await db.run('INSERT INTO shares (id, user_id, file_path) VALUES (?, ?, ?)', [shareId, req.user.id, filePath])
    
    res.json({ shareId, url: `/shared/${shareId}` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// 11. Access Share Link (Public Endpoint)
app.get('/api/public/shares/:shareId', async (req, res) => {
  try {
    const db = await getDb()
    const share = await db.get('SELECT s.*, u.username FROM shares s JOIN users u ON s.user_id = u.id WHERE s.id = ?', [req.params.shareId])
    
    if (!share) return res.status(404).json({ error: 'Tautan tidak valid atau kadaluarsa' })

    const userStoragePath = path.join(STORAGE_DIR, share.username)
    const normalizedPath = path.normalize(share.file_path).replace(/^(\.\.[\/\\])+/, '')
    const safePath = path.join(userStoragePath, normalizedPath)

    if (!fs.existsSync(safePath)) return res.status(404).json({ error: 'File tidak ditemukan' })

    const stats = await fs.stat(safePath)
    
    if (req.query.download === '1') {
      return res.download(safePath)
    }

    // Return file info for preview
    const itemName = path.basename(safePath)
    res.json({
      name: itemName,
      size: stats.size,
      isFolder: stats.isDirectory(),
      contentType: stats.isDirectory() ? '' : mime.lookup(itemName) || 'application/octet-stream'
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// 12. Download ZIP multiple files/folder
app.post('/api/files/zip', authenticateToken, (req, res) => {
  try {
    const { paths } = req.body
    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return res.status(400).json({ error: 'Paths required' })
    }

    res.attachment('Panyeppen_Cloud_Download.zip')
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    archive.on('error', (err) => {
      res.status(500).send({ error: err.message })
    })

    archive.pipe(res)

    for (const itemPath of paths) {
      const { safePath } = getSafePath(req.user.username, itemPath)
      if (fs.existsSync(safePath)) {
        const stats = fs.statSync(safePath)
        const name = path.basename(safePath)
        if (stats.isDirectory()) {
          archive.directory(safePath, name)
        } else {
          archive.file(safePath, { name })
        }
      }
    }
    
    archive.finalize()
  } catch (err) {
    console.error(err)
    if (!res.headersSent) res.status(500).json({ error: err.message })
  }
})

// ---------------------------------------------------------
// Production Static File Serving
// ---------------------------------------------------------
const distPath = path.join(__dirname, 'dist')
if (fs.existsSync(distPath)) {
  console.log('[INIT] Serving static files from dist/')
  app.use(express.static(distPath))
  // Fallback for React Router
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(distPath, 'index.html'))
    } else {
      next()
    }
  })
} else {
  console.log('[INIT] No dist/ folder found. API only mode.')
}

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
})
