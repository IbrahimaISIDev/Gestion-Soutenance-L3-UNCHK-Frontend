import { useQuery } from '@tanstack/react-query'
import { getMesSoutenances } from '../../api/soutenances'
import { useAuth } from '../../contexts/AuthContext'

const STATUT_COLORS = {
  brouillon: 'bg-gray-100 text-gray-700',
  planifiee: 'bg-blue-100 text-blue-700',
  confirmee: 'bg-green-100 text-green-700',
  realisee: 'bg-purple-100 text-purple-700',
  annulee: 'bg-red-100 text-red-700',
}

export default function EtudiantDashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['mes-soutenances'],
    queryFn: getMesSoutenances,
  })

  const soutenances = data?.data ?? []

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-gray-900">Tableau de bord</h1>
      <p className="mb-6 text-sm text-gray-500">Bienvenue, {user?.name} !</p>

      <h2 className="mb-3 font-semibold text-gray-800">Mes soutenances</h2>

      {isLoading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : soutenances.length === 0 ? (
        <p className="text-gray-500">Aucune soutenance planifiée pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {soutenances.map((s) => (
            <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{s.titre}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{s.filiere} · {s.type}</p>
                </div>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${STATUT_COLORS[s.statut]}`}>
                  {s.statut}
                </span>
              </div>

              {(s.date || s.salle) && (
                <div className="mt-3 flex gap-4 text-sm text-gray-600">
                  {s.date && <span>Date : <strong>{s.date}</strong>{s.heure && ` à ${s.heure}`}</span>}
                  {s.salle && <span>Salle : <strong>{s.salle.nom}</strong></span>}
                </div>
              )}

              {s.pv && (
                <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                  <p className="font-medium text-gray-800">Résultat</p>
                  <p className="mt-0.5 text-gray-700">
                    Note : <strong>{s.pv.note ?? '—'}</strong>
                    {s.pv.mention && <span className="ml-2">({s.pv.mention})</span>}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
