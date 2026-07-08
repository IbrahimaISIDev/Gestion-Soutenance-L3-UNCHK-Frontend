import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSoutenances, confirmSoutenance, cancelSoutenance } from '../../api/soutenances'

const STATUT_COLORS = {
  brouillon: 'bg-gray-100 text-gray-700',
  planifiee: 'bg-blue-100 text-blue-700',
  confirmee: 'bg-green-100 text-green-700',
  realisee: 'bg-purple-100 text-purple-700',
  annulee: 'bg-red-100 text-red-700',
}

export default function Soutenances() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['soutenances', page],
    queryFn: () => getSoutenances(page),
  })

  const confirm = useMutation({
    mutationFn: confirmSoutenance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['soutenances'] }),
  })

  const cancel = useMutation({
    mutationFn: cancelSoutenance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['soutenances'] }),
  })

  if (isLoading) return <p className="text-gray-500">Chargement...</p>
  if (isError) return <p className="text-red-500">Erreur lors du chargement.</p>

  const { data: soutenances, meta } = data

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Soutenances</h1>
        <Link
          to="/secretaire/soutenances/new"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          + Nouvelle soutenance
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Étudiant</th>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Filière</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {soutenances.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {s.etudiant?.name ?? '—'}
                </td>
                <td className="px-4 py-3 max-w-xs truncate text-gray-700">{s.titre}</td>
                <td className="px-4 py-3 text-gray-600">{s.filiere}</td>
                <td className="px-4 py-3 text-gray-600">
                  {s.date ?? <span className="text-gray-400">Non planifiée</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_COLORS[s.statut]}`}>
                    {s.statut}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      to={`/secretaire/soutenances/${s.id}`}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      Détail
                    </Link>
                    {s.statut === 'planifiee' && (
                      <button
                        onClick={() => confirm.mutate(s.id)}
                        disabled={confirm.isPending}
                        className="text-xs text-green-600 hover:underline"
                      >
                        Confirmer
                      </button>
                    )}
                    {!['annulee', 'realisee'].includes(s.statut) && (
                      <button
                        onClick={() => {
                          if (window.confirm('Annuler cette soutenance ?')) cancel.mutate(s.id)
                        }}
                        disabled={cancel.isPending}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            {meta.from}–{meta.to} sur {meta.total} soutenances
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border px-3 py-1 disabled:opacity-40"
            >
              Précédent
            </button>
            <button
              disabled={page === meta.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border px-3 py-1 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
