import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((type, message, duration = 3500) => {
    const id = nextId++
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration)
  }, [])

  const toast = {
    success: (msg) => add('success', msg),
    error:   (msg) => add('error', msg, 5000),
    info:    (msg) => add('info', msg),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

const STYLES = {
  success: { bar: '#22c55e', icon: '✓', bg: 'bg-white border-green-200', text: 'text-gray-800' },
  error:   { bar: '#ef4444', icon: '✕', bg: 'bg-white border-red-200',   text: 'text-gray-800' },
  info:    { bar: '#c9a227', icon: 'ℹ', bg: 'bg-white border-amber-200',  text: 'text-gray-800' },
}

function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2" style={{ maxWidth: 360 }}>
      {toasts.map((t) => {
        const s = STYLES[t.type] ?? STYLES.info
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 overflow-hidden rounded-xl border shadow-lg ${s.bg}`}
            style={{ animation: 'toast-in 0.22s ease' }}
          >
            <div className="w-1 self-stretch shrink-0 rounded-l-xl" style={{ backgroundColor: s.bar }} />
            <div className="flex items-start gap-2.5 py-3 pr-4">
              <span className="mt-0.5 text-sm font-bold" style={{ color: s.bar }}>{s.icon}</span>
              <p className={`text-sm leading-snug ${s.text}`}>{t.message}</p>
            </div>
          </div>
        )
      })}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
