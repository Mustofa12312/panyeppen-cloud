import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CloudArrowUpIcon,
  DocumentPlusIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { upload } from '../services/files'
import { UploadProgressItem } from '../components/UploadProgress'
import { formatFileSize } from '../utils/formatFileSize'
import { useAuth } from '../hooks/useAuth'

function TargetFolderSelector({ value, onChange }) {
  return (
    <div className="card p-4">
      <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">
        Upload ke Folder
      </label>
      <input
        id="upload-target-folder"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/ (root)"
        className="input text-sm h-11"
      />
      <p className="text-xs text-[#94a3b8] mt-2">
        Kosongkan untuk upload ke root. Contoh: /Dokumen/Surat
      </p>
    </div>
  )
}

export default function Upload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [targetFolder, setTargetFolder] = useState('/')
  const [uploadItems, setUploadItems] = useState([]) // { file, progress, status, error, controller }
  const [isDragging, setIsDragging] = useState(false)
  const allDone = uploadItems.length > 0 && uploadItems.every((i) => i.status === 'success' || i.status === 'error')

  const addFiles = (files) => {
    const newItems = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending',
      error: null,
      controller: null,
    }))
    setUploadItems((prev) => [...prev, ...newItems])
    // Langsung upload
    newItems.forEach((item) => startUpload(item))
  }

  const startUpload = async (item) => {
    const controller = new AbortController()

    // Update status ke uploading
    setUploadItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, status: 'uploading', controller }
          : i
      )
    )

    try {
      await upload(
        targetFolder || '/',
        item.file,
        (percent) => {
          setUploadItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress: percent } : i))
          )
        },
        controller.signal
      )
      setUploadItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'success', progress: 100 } : i))
      )
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        setUploadItems((prev) => prev.filter((i) => i.id !== item.id))
      } else {
        setUploadItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error', error: err.message || 'Upload gagal' }
              : i
          )
        )
      }
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files?.length) {
      addFiles(e.target.files)
      e.target.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleCancel = (item) => {
    item.controller?.abort()
  }

  const handleClearAll = () => {
    setUploadItems([])
  }

  const successCount = uploadItems.filter((i) => i.status === 'success').length
  const errorCount = uploadItems.filter((i) => i.status === 'error').length

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="pt-1">
        <h2 className="text-xl font-bold text-[#0f172a]">Upload File</h2>
        <p className="text-xs text-[#94a3b8] mt-0.5">Upload ke Panyeppen Cloud</p>
      </div>

      {/* Target folder */}
      <TargetFolderSelector value={targetFolder} onChange={setTargetFolder} />

      {/* Drop zone */}
      <div
        className={`card border-2 border-dashed flex flex-col items-center justify-center py-12 px-6 cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[#16a34a] bg-[#f0fdf4]'
            : 'border-[#e2e8f0] hover:border-[#16a34a] hover:bg-[#f0fdf4]'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        id="upload-dropzone"
      >
        <div
          className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-colors ${
            isDragging ? 'bg-[#16a34a]' : 'bg-[#f0fdf4]'
          }`}
        >
          <CloudArrowUpIcon
            className={`w-8 h-8 transition-colors ${isDragging ? 'text-white' : 'text-[#16a34a]'}`}
            strokeWidth={1.5}
          />
        </div>
        <p className="text-base font-bold text-[#0f172a] mb-1">
          {isDragging ? 'Lepaskan file di sini' : 'Pilih atau drag file'}
        </p>
        <p className="text-xs text-[#94a3b8] text-center">
          Mendukung semua jenis file
        </p>

        <button
          id="upload-select-btn"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
          className="btn btn-primary mt-5 text-sm gap-2"
        >
          <DocumentPlusIcon className="w-4 h-4" />
          Pilih File
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        id="upload-file-input"
      />

      {/* Upload items */}
      {uploadItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="section-title">
              {successCount > 0 && `${successCount} berhasil`}
              {errorCount > 0 && ` · ${errorCount} gagal`}
              {!successCount && !errorCount && `${uploadItems.length} file`}
            </p>
            {allDone && (
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-[#64748b] hover:text-[#dc2626] transition-colors"
              >
                Bersihkan
              </button>
            )}
          </div>

          <div className="space-y-2">
            {uploadItems.map((item) => (
              <UploadProgressItem
                key={item.id}
                file={item.file}
                progress={item.progress}
                status={item.status}
                error={item.error}
                onCancel={() => handleCancel(item)}
              />
            ))}
          </div>

          {/* Summary action */}
          {allDone && successCount > 0 && (
            <div className="card p-4 bg-[#f0fdf4] border border-[#bbf7d0] flex items-center gap-3 animate-fade-in">
              <CheckCircleIcon className="w-6 h-6 text-[#16a34a] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#15803d]">
                  {successCount} file berhasil diupload
                </p>
              </div>
              <button
                onClick={() => navigate('/files')}
                className="btn btn-primary text-xs h-9 px-3.5"
              >
                Lihat Files
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
