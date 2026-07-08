import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markAsRead } from '../../api/notifications'

function IconBell() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    + ' à '
    + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function Notifications() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  })

  const read = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications = data?.data ?? []
  const nonLues = notifications.filter((n) => !n.lu).length

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Notifications</h1>
            {nonLues > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white" style={{ backgroundColor: '#ef4444' }}>
                {nonLues}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            {nonLues > 0 ? `${nonLues} non lue${nonLues > 1 ? 's' : ''}` : 'Tout est lu'}
          </p>
        </div>
        <div className="text-gray-400"><IconBell /></div>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-gray-400">Chargement...</p>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <IconBell />
          </div>
          <p className="text-sm font-medium text-gray-700">Aucune notification</p>
          <p className="mt-1 text-xs text-gray-400">Vous serez notifié des événements importants ici.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-5 transition-colors ${
                n.lu
                  ? 'border-gray-200 bg-white'
                  : 'border-indigo-100 bg-indigo-50/60'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Dot indicateur */}
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.lu ? 'bg-gray-300' : ''}`}
                  style={n.lu ? {} : { backgroundColor: '#c9a227' }}
                />

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${n.lu ? 'text-gray-700' : ''}`}
                    style={n.lu ? {} : { color: '#0d1b35' }}
                  >
                    {n.titre}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{n.message}</p>
                  <p className="mt-2 text-[11px] text-gray-400">{formatDateTime(n.created_at)}</p>
                </div>

                {!n.lu && (
                  <button
                    onClick={() => read.mutate(n.id)}
                    disabled={read.isPending}
                    title="Marquer comme lu"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-400 transition hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40"
                  >
                    <IconCheck />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
