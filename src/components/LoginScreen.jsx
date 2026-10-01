import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [showPw, setShowPw] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const correct = import.meta.env.VITE_APP_PASSWORD
    if (password === correct) {
      localStorage.setItem('ig_auth', '1')
      onLogin()
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center px-8">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-16 h-16 mb-8">
        <defs>
          <linearGradient id="g" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f09433"/>
            <stop offset="50%" stopColor="#dc2743"/>
            <stop offset="100%" stopColor="#bc1888"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill="url(#g)"/>
        <rect x="24" y="24" width="52" height="52" rx="14" fill="none" stroke="white" strokeWidth="5"/>
        <circle cx="50" cy="50" r="14" fill="none" stroke="white" strokeWidth="5"/>
        <circle cx="68" cy="32" r="4" fill="white"/>
      </svg>

      <h1 className="font-bold text-2xl mb-1 tracking-tight">Accedi</h1>
      <p className="text-sm text-gray-400 mb-8">Inserisci la password per continuare</p>

      <form onSubmit={handleSubmit} className="w-full max-w-[320px] space-y-3">
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false) }}
            placeholder="Password"
            autoComplete="current-password"
            className={`w-full bg-gray-100 dark:bg-gray-900 rounded-xl px-4 py-3 text-sm outline-none pr-11 transition-colors ${
              error ? 'border-2 border-red-400' : 'border border-transparent'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center">Password errata. Riprova.</p>
        )}

        <button
          type="submit"
          disabled={!password}
          className="w-full py-3 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white rounded-xl font-semibold text-sm disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          Entra
        </button>
      </form>
    </div>
  )
}
