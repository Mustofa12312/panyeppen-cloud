import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CloudArrowUpIcon,
  DocumentPlusIcon,
  FolderPlusIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { upload, createFolder } from '../services/files'
import { UploadProgressItem } from '../components/UploadProgress'
import { useAuth } from '../hooks/useAuth'

function TargetFolderSelector({ value, onChange }) {
  return (
    <div className="card p-4">
      <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">
        Folder Tujuan
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/ (root)"
        className="input text-sm h-11"
      />
      <p className="text-xs text-[#94a3b8] mt-2">
        Tentukan path tujuan upload. Jika folder belum ada, sistem akan otomatis membuatnya.
      </p>
    </div>
  )
}

export default function Upload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)
  const [targetFolder, setTargetFolder] = useState('/')
  const [uploadItems, setUploadItems] = useState([]) // { file, progress, status, error, controller, uploadPath }
  const [isDragging, setIsDragging] = useState(false)
  const allDone = uploadItems.length > 0 && uploadItems.every((i) => i.status === 'success' || i.status === 'error')

  const addFiles = (files, isFolderUpload = false) => {
    const newItems = Array.from(files).map((file) => {
      // file.webkitRelativePath berisi struktur path asli jika diupload via folder picker
      const relativePath = file.webkitRelativePath
      
      let uploadPath = targetFolder || '/'
      if (isFolderUpload && relativePath) {
        // pisahkan folder dari nama file
        const pathParts = relativePath.split('/')
        pathParts.pop() // hilangkan nama file
        const folderStruct = pathParts.join('/')
        
        uploadPath = targetFolder.endsWith('/') 
          ? `${targetFolder}${folderStruct}`
          : `${targetFolder}/${folderStruct}`
      }

      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'pending',
        error: null,
        controller: null,
        uploadPath,
      }
    })
    setUploadItems((prev) => [...prev, ...newItems])
    newItems.forEach((item) => startUpload(item))
  }

  const startUpload = async (item) => {
    const controller = new AbortController()

    setUploadItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading', controller } : i))
    )

    try {
      // Pastikan folder tujuan dibuat (opsional, jika API mendukung auto-create tidak perlu. Namun amannya dibuat)
      if (item.uploadPath !== '/') {
        await createFolder('/', item.uploadPath.replace(/^\//, ''))
      }

      await upload(
        item.uploadPath,
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
          prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: err.message || 'Upload gagal' } : i))
        )
      }
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files?.length) {
      addFiles(e.target.files, false)
      e.target.value = ''
    }
  }

  const handleFolderSelect = (e) => {
    if (e.target.files?.length) {
      addFiles(e.target.files, true)
      e.target.value = ''
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) {
      // Drag and drop natively on most browsers populates dataTransfer.files without webkitRelativePath
      // Advanced DataTransferItem API required for true folder structure via drag & drop. 
      // For simplicity here, we treat them as individual files.
      addFiles(e.dataTransfer.files, false)
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
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="pt-1">
        <h2 className="text-xl font-bold text-[#0f172a]">Upload File / Folder</h2>
        <p className="text-xs text-[#94a3b8] mt-0.5">Unggah data ke Panyeppen Cloud</p>
      </div>

      {/* Target folder */}
      <TargetFolderSelector value={targetFolder} onChange={setTargetFolder} />

      {/* Drop zone */}
      <div
        className={`card border-2 border-dashed flex flex-col items-center justify-center py-12 px-6 transition-all duration-200 ${
          isDragging
            ? 'border-teal-500 bg-teal-50'
            : 'border-slate-200 hover:border-teal-400 hover:bg-teal-50/30'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div
          className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-colors ${
            isDragging ? 'bg-teal-500' : 'bg-teal-50'
          }`}
        >
          <CloudArrowUpIcon
            className={`w-8 h-8 transition-colors ${isDragging ? 'text-white' : 'text-teal-600'}`}
            strokeWidth={1.5}
          />
        </div>
        <p className="text-base font-bold text-slate-800 mb-1">
          {isDragging ? 'Lepaskan item di sini' : 'Drag & Drop item di sini'}
        </p>
        <p className="text-xs text-slate-500 text-center mb-6">
          Mendukung unggahan banyak file dan folder
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 h-11 bg-white border-2 border-teal-600 text-teal-700 font-bold text-sm rounded-xl hover:bg-teal-50 transition-colors shadow-sm"
          >
            <DocumentPlusIcon className="w-5 h-5" />
            Pilih File
          </button>
          <button
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-2 px-5 h-11 bg-teal-600 text-white font-bold text-sm rounded-xl hover:bg-teal-700 transition-colors shadow-md"
          >
            <FolderPlusIcon className="w-5 h-5" />
            Pilih Folder
          </button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
      <input ref={folderInputRef} type="file" webkitdirectory="true" directory="true" multiple className="hidden" onChange={handleFolderSelect} />

      {/* Upload items */}
      {uploadItems.length > 0 && (
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="section-title">
              {successCount > 0 && `${successCount} berhasil`}
              {errorCount > 0 && ` · ${errorCount} gagal`}
              {!successCount && !errorCount && `${uploadItems.length} file`}
            </p>
            {allDone && (
              <button onClick={handleClearAll} className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors">
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

          {allDone && successCount > 0 && (
            <div className="card p-4 bg-teal-50 border border-teal-200 flex items-center gap-3 animate-fade-in">
              <CheckCircleIcon className="w-6 h-6 text-teal-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-teal-800">
                  {successCount} file berhasil diupload
                </p>
              </div>
              <button onClick={() => navigate('/files')} className="btn bg-white text-teal-700 border border-teal-300 hover:bg-teal-100 text-xs h-9 px-3.5">
                Lihat File
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
