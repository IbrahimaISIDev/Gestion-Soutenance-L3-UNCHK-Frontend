import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAuditLogs, cleanAuditLogs } from '../../api/audit'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function AdminAudit() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['audit', page],
    queryFn: () => getAuditLogs(page),
  })

  const clean = useMutation({
    mutationFn: cleanAuditLogs,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['audit'] }),
  })

  const logs = data?.data ?? []
  const meta = data?.meta

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Journal d'audit</h1>
          <p className="mt-0.5 text-sm text-gray-500">{meta?.total ?? '—'} entrées enregistrées</p>
        </div>
        <button
          onClick={() => { if (window.confirm('Supprimer les entrées de plus de 6 mois ?')) clean.mutate() }}
          disabled={clean.isPending}
          className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {clean.isPending ? 'Nettoyage…' : 'Nettoyer (> 6 mois)'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400">Chargement...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Date', 'Heure', 'Utilisateur', 'Action', 'Détails', 'IP'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm text-gray-500 tabular-nums whitespace-nowrap">
                    {formatDate(l.created_at)}
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-700 tabular-nums whitespace-nowrap">
                    {formatTime(l.created_at)}
                  </td>
                  <td className="px-5 py-4 font-semibold" style={{ color: '#0d1b35' }}>
                    {l.utilisateur?.name ?? <span className="font-normal text-gray-400">Système</span>}
                  </td>
                  <td className="px-5 py-4 text-gray-700">{l.action}</td>
                  <td className="max-w-[200px] truncate px-5 py-4 text-gray-500">
                    {l.details ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-400">
                    {l.ip_address ?? <span className="font-sans text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                    Aucune entrée dans le journal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="mt-5 flex items-center gap-2">
          {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition"
              style={
                p === page
                  ? { backgroundColor: '#0d1b35', color: '#fff' }
                  : { backgroundColor: 'transparent', color: '#374151' }
              }
            >
              {p}
            </button>
          ))}
          {meta.last_page > 5 && <span className="text-gray-400">…</span>}
        </div>
      )}
    </div>
  )
}
