import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function SearchBar({
  placeholder = 'Cari file...',
  onSearch,
  navigateToSearch = true,
  autoFocus = false,
  value: externalValue,
  onChange: externalOnChange,
}) {
  const [internalValue, setInternalValue] = useState('')
  const navigate = useNavigate()
  const debounceRef = useRef(null)

  const value = externalValue !== undefined ? externalValue : internalValue
  const isControlled = externalValue !== undefined

  const handleChange = (e) => {
    const newVal = e.target.value
    if (!isControlled) setInternalValue(newVal)
    if (externalOnChange) externalOnChange(newVal)

    // Debounce search
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (onSearch) onSearch(newVal)
    }, 400)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    if (navigateToSearch) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`)
    } else {
      if (onSearch) onSearch(value.trim())
    }
  }

  const handleClear = () => {
    if (!isControlled) setInternalValue('')
    if (externalOnChange) externalOnChange('')
    if (onSearch) onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <MagnifyingGlassIcon className="absolute left-3.5 w-4.5 h-4.5 text-[#94a3b8] pointer-events-none" />
        <input
          id="search-input"
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="input pl-10 pr-10 h-11 bg-[#f8fafc] border-[#e2e8f0] text-sm"
          autoComplete="off"
          enterKeyHint="search"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 w-5 h-5 flex items-center justify-center rounded-full bg-[#e2e8f0] text-[#64748b] hover:bg-[#cbd5e1] transition-colors"
            aria-label="Hapus pencarian"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </form>
  )
}
