import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import mime from 'mime-types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3001

// Configuration
const STORAGE_DIR = process.env.STORAGE_PATH || path.join(__dirname, 'storage')
console.log(`[INIT] Storage directory set to: ${STORAGE_DIR}`)

// Ensure storage directory exists
fs.ensureDirSync(STORAGE_DIR)

// Middleware
app.use(cors())
app.use(express.json())

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetPath = req.query.path || '/'
    const fullPath = path.join(STORAGE_DIR, targetPath)
    fs.ensureDirSync(fullPath)
    cb(null, fullPath)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

// Security helper to prevent directory traversal
function getSafePath(reqPath) {
  const normalizedPath = path.normalize(reqPath || '/').replace(/^(\.\.[\/\\])+/, '')
  const safePath = path.join(STORAGE_DIR, normalizedPath)
  
  if (!safePath.startsWith(STORAGE_DIR)) {
    throw new Error('Invalid path')
  }
  return { safePath, relativePath: normalizedPath === '.' ? '/' : normalizedPath }
}

// ---------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------

// 1. List files and folders
app.get('/api/files', async (req, res) => {
  try {
    const { safePath, relativePath } = getSafePath(req.query.path)
    
    if (!fs.existsSync(safePath)) {
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
    
    // Sort: Folders first, then files alphabetically
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
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  res.json({ message: 'File uploaded successfully', file: req.file.originalname })
})

// 3. Create folder
app.post('/api/files/folder', async (req, res) => {
  try {
    const { path: reqPath, folderName } = req.body
    if (!folderName) return res.status(400).json({ error: 'Folder name required' })
    
    const { safePath, relativePath } = getSafePath(reqPath)
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
app.put('/api/files/rename', async (req, res) => {
  try {
    const { oldPath, newName } = req.body
    if (!oldPath || !newName) return res.status(400).json({ error: 'oldPath and newName required' })
    
    const { safePath: oldSafePath } = getSafePath(oldPath)
    
    if (!fs.existsSync(oldSafePath)) {
      return res.status(404).json({ error: 'Original file not found' })
    }
    
    const parentDir = path.dirname(oldSafePath)
    const newSafePath = path.join(parentDir, newName)
    
    await fs.rename(oldSafePath, newSafePath)
    
    const newRelativePath = newSafePath.substring(STORAGE_DIR.length).replace(/\\/g, '/') || '/'
    res.json({ message: 'Renamed successfully', path: newRelativePath })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// 5. Delete file/folder
app.delete('/api/files', async (req, res) => {
  try {
    const { safePath } = getSafePath(req.query.path)
    
    if (safePath === STORAGE_DIR) {
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

// 6. Download file
app.get('/api/files/download', (req, res) => {
  try {
    const { safePath } = getSafePath(req.query.path)
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
app.get('/api/files/preview', (req, res) => {
  try {
    const { safePath } = getSafePath(req.query.path)
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
app.get('/api/files/search', async (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase()
    const startPath = req.query.path || '/'
    const { safePath: searchRoot } = getSafePath(startPath)
    
    if (!query) return res.json([])
    if (!fs.existsSync(searchRoot)) return res.json([])
    
    const results = []
    
    // Simple recursive search
    async function scanDir(currentSafePath) {
      const items = await fs.readdir(currentSafePath)
      for (const itemName of items) {
        const itemPath = path.join(currentSafePath, itemName)
        const stats = await fs.stat(itemPath)
        const isFolder = stats.isDirectory()
        
        const itemRelativePath = itemPath.substring(STORAGE_DIR.length).replace(/\\/g, '/') || '/'
        
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

// ---------------------------------------------------------
// Production Static File Serving
// ---------------------------------------------------------
const distPath = path.join(__dirname, 'dist')
if (fs.existsSync(distPath)) {
  console.log('[INIT] Serving static files from dist/')
  app.use(express.static(distPath))
  // Fallback for React Router
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(distPath, 'index.html'))
    }
  })
} else {
  console.log('[INIT] No dist/ folder found. API only mode.')
}

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
})
