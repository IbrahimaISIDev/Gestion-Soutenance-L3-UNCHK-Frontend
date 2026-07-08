export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmer', confirmClass, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        {title && (
          <p className="mb-2 text-base font-bold" style={{ color: '#0d1b35' }}>{title}</p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={confirmClass ?? 'rounded-lg px-4 py-2 text-sm font-bold text-white'}
            style={!confirmClass ? { backgroundColor: '#0d1b35' } : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
