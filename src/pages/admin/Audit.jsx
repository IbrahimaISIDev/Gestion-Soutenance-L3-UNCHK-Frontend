import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuditLogs, cleanAuditLogs } from '../../api/audit'

export default function AdminAudit() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['audit', page], queryFn: () => getAuditLogs(page) })

  const clean = useMutation({
    mutationFn: cleanAuditLogs,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audit'] }),
  })

  if (isLoading) return <p className="text-gray-500">Chargement...</p>
  const { data: logs, meta } = data

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Journal d'audit</h1>
        <button
          onClick={() => { if (window.confirm('Supprimer les entrées de plus de 6 mois ?')) clean.mutate() }}
          disabled={clean.isPending}
          className="rounded-lg border border-red-400 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          Nettoyer (&gt;6 mois)
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Détails</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(l.created_at).toLocaleString('fr-FR')}</td>
                <td className="px-4 py-3 text-gray-700">{l.utilisateur?.name ?? <span className="text-gray-400">Système</span>}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{l.action}</td>
                <td className="px-4 py-3 max-w-xs truncate text-gray-600">{l.details ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{l.ip_address ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>{meta.from}–{meta.to} sur {meta.total} entrées</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Précédent</button>
            <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}
    </div>
  )
}
