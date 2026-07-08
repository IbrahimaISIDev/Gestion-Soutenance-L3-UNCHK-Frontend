import { useQuery } from '@tanstack/react-query'
import { getMesSoutenances } from '../../api/enseignant'

const STATUT_BADGE = {
  brouillon: 'bg-gray-100 text-gray-500',
  planifiee: 'border border-sky-200 bg-sky-50 text-sky-700',
  confirmee: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  realisee:  'border border-purple-200 bg-purple-50 text-purple-700',
  annulee:   'border border-red-200 bg-red-50 text-red-500',
}
const STATUT_LABELS = {
  brouillon: 'Brouillon',
  planifiee: 'Planifiée',
  confirmee: 'Confirmée',
  realisee:  'Réalisée',
  annulee:   'Annulée',
}
const TYPE_BADGE = {
  licence:  'bg-sky-50 text-sky-700',
  master:   'bg-indigo-50 text-indigo-700',
  doctorat: 'bg-purple-50 text-purple-700',
}

function formatDate(iso) {
  if (!iso) return <span className="text-gray-300">—</span>
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700">Aucune soutenance</p>
      <p className="mt-1 text-xs text-gray-400">Vous n'êtes directeur ou membre du jury d'aucune soutenance.</p>
    </div>
  )
}

export default function MesSoutenances() {
  const { data, isLoading } = useQuery({
    queryKey: ['enseignant-soutenances'],
    queryFn: getMesSoutenances,
  })

  const soutenances = data?.data ?? []
  const total = soutenances.length
  const aVenir = soutenances.filter((s) => ['planifiee', 'confirmee'].includes(s.statut)).length

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Mes soutenances</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {total} soutenance{total !== 1 ? 's' : ''} — {aVenir} à venir
        </p>
      </div>

      {isLoading ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['#', 'Titre', 'Étudiant', 'Filière / Type', 'Date', 'Salle', 'Note', 'Statut'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, c) => (
                    <td key={c} className="px-5 py-4">
                      <div className="h-3.5 animate-pulse rounded-md bg-gray-100" style={{ width: c === 0 ? '2rem' : '60%' }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : soutenances.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['#', 'Titre', 'Étudiant', 'Filière / Type', 'Date', 'Salle', 'Note', 'Statut'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {soutenances.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm text-gray-400">
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td className="max-w-[180px] truncate px-5 py-4 font-semibold" style={{ color: '#0d1b35' }}>
                    {s.titre}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {s.etudiant?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">{s.filiere}</span>
                      <span className={`self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TYPE_BADGE[s.type] ?? 'bg-gray-100 text-gray-500'}`}>
                        {s.type}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                    {formatDate(s.date)}
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {s.salle?.nom ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    {s.pv?.note != null ? (
                      <span className="font-bold" style={{ color: s.pv.note >= 10 ? '#059669' : '#dc2626' }}>
                        {Number(s.pv.note).toFixed(2)}/20
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUT_BADGE[s.statut] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUT_LABELS[s.statut] ?? s.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
