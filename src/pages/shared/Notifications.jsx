import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markAsRead } from '../../api/notifications'

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

  if (isLoading) return <p className="text-gray-500">Chargement...</p>

  const notifications = data?.data ?? []
  const nonLues = notifications.filter((n) => !n.lu)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          Notifications
          {nonLues.length > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              {nonLues.length}
            </span>
          )}
        </h1>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">Aucune notification.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition-colors ${n.lu ? 'border-gray-200 bg-white' : 'border-primary-200 bg-primary-50'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`font-semibold ${n.lu ? 'text-gray-900' : 'text-primary-900'}`}>
                    {n.titre}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                  <p className="mt-1.5 text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                {!n.lu && (
                  <button
                    onClick={() => read.mutate(n.id)}
                    disabled={read.isPending}
                    className="ml-4 shrink-0 rounded-lg border border-primary-300 px-3 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100 disabled:opacity-60"
                  >
                    Marquer comme lu
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
