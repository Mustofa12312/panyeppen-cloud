import { useState, useCallback, useEffect } from 'react'
import * as filesService from '../services/files'

/**
 * Hook untuk manage file list state dan operations
 * @param {string} initialPath - path awal yang akan di-load
 */
export function useFiles(initialPath = '/') {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPath, setCurrentPath] = useState(initialPath)

  const loadFiles = useCallback(async (path = currentPath) => {
    setLoading(true)
    setError(null)
    try {
      const items = await filesService.list(path)
      setFiles(items)
      setCurrentPath(path)
    } catch (err) {
      setError(err.message || 'Gagal memuat file')
    } finally {
      setLoading(false)
    }
  }, [currentPath])

  useEffect(() => {
    loadFiles(initialPath)
  }, []) // eslint-disable-line

  const navigate = useCallback((path) => {
    loadFiles(path)
  }, [loadFiles])

  const refresh = useCallback(() => {
    loadFiles(currentPath)
  }, [loadFiles, currentPath])

  const deleteFile = useCallback(async (path) => {
    await filesService.deleteItem(path)
    setFiles((prev) => prev.filter((f) => f.path !== path))
  }, [])

  const bulkDeleteFiles = useCallback(async (paths) => {
    await filesService.bulkDelete(paths)
    setFiles((prev) => prev.filter((f) => !paths.includes(f.path)))
  }, [])

  const renameFile = useCallback(async (oldPath, newName) => {
    const newPath = await filesService.rename(oldPath, newName)
    await loadFiles(currentPath)
    return newPath
  }, [loadFiles, currentPath])

  const createFolder = useCallback(async (folderName) => {
    await filesService.createFolder(currentPath, folderName)
    await loadFiles(currentPath)
  }, [loadFiles, currentPath])

  // Pisahkan folders dan files
  const folders = files.filter((f) => f.isFolder)
  const fileItems = files.filter((f) => !f.isFolder)

  return {
    files,
    folders,
    fileItems,
    loading,
    error,
    currentPath,
    navigate,
    refresh,
    deleteFile,
    bulkDeleteFiles,
    renameFile,
    createFolder,
    loadFiles,
  }
}
