import { Link } from 'react-router-dom'
import { FaceFrownIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center">
            <FaceFrownIcon className="w-16 h-16 text-teal-600" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4">404 - Halaman Tidak Ditemukan</h1>
        <p className="text-slate-500 mb-8">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <Link 
          to="/"
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl font-bold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', boxShadow: '0 4px 14px 0 rgba(20,184,166,0.3)' }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
