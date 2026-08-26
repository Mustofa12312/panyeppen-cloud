export default function AuthLayout({ children }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-[#f8fafc] px-5 py-8">
      {/* Decorative background blobs */}
      <div
        className="fixed top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        }}
      />
      <div
        className="fixed bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(22,163,74,0.06) 0%, transparent 70%)',
          transform: 'translate(-30%, 30%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {children}
      </div>
    </div>
  )
}
