import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSoutenances, confirmSoutenance, cancelSoutenance } from '../../api/soutenances'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import TableSkeleton from '../../components/TableSkeleton'
import { useDebounce } from '../../hooks/useDebounce'

const STATUT_BADGE = {
  brouillon: 'bg-gray-100 text-gray-600',
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

const STATUT_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'planifiee', label: 'Planifiée' },
  { value: 'confirmee', label: 'Confirmée' },
  { value: 'realisee',  label: 'Réalisée' },
  { value: 'annulee',   label: 'Annulée' },
]

function SearchIcon() {
  return (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function XIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function formatDate(iso) {
  if (!iso) return <span className="text-gray-300">—</span>
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function Soutenances() {
  const navigate = useNavigate()
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const debouncedSearch           = useDebounce(search)
  const [statutFilter, setStatutFilter] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(null)
  const qc = useQueryClient()
  const toast = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['soutenances', page],
    queryFn: () => getSoutenances(page),
  })

  const confirmMut = useMutation({
    mutationFn: confirmSoutenance,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['soutenances'] }); toast.success('Soutenance confirmée.') },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Confirmation impossible.'),
  })
  const cancel = useMutation({
    mutationFn: cancelSoutenance,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['soutenances'] }); toast.success('Soutenance annulée.') },
    onError: () => toast.error('Erreur lors de l\'annulation.'),
  })

  const soutenances = useMemo(() => {
    let list = data?.data ?? []
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(
        (s) =>
          s.titre?.toLowerCase().includes(q) ||
          s.etudiant?.name?.toLowerCase().includes(q) ||
          s.filiere?.toLowerCase().includes(q)
      )
    }
    if (statutFilter) list = list.filter((s) => s.statut === statutFilter)
    return list
  }, [data, debouncedSearch, statutFilter])

  const meta = data?.meta

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Soutenances</h1>
          <p className="mt-0.5 text-sm text-gray-500">{meta?.total ?? '—'} soutenances enregistrées</p>
        </div>
        <button
          onClick={() => navigate('/secretaire/planification')}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white"
          style={{ backgroundColor: '#0d1b35' }}
        >
          + Planifier une soutenance
        </button>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input
            className="input w-72 pl-9"
            placeholder="Rechercher étudiant, titre..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="input"
          value={statutFilter}
          onChange={(e) => { setStatutFilter(e.target.value); setPage(1) }}
        >
          {STATUT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <ConfirmDialog
        open={!!confirmCancel}
        title="Annuler la soutenance"
        message="Annuler cette soutenance ? Les membres du jury et l'étudiant seront notifiés."
        confirmLabel="Annuler la soutenance"
        confirmClass="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        onConfirm={() => { cancel.mutate(confirmCancel); setConfirmCancel(null) }}
        onCancel={() => setConfirmCancel(null)}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['#', 'Étudiant', 'Titre', 'Filière', 'Date', 'Statut', 'Actions'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {isLoading ? <TableSkeleton cols={7} rows={7} /> : <tbody className="divide-y divide-gray-50">
              {soutenances.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm text-gray-400">
                    {String(((page - 1) * 15) + i + 1).padStart(2, '0')}
                  </td>
                  <td className="px-5 py-4 font-semibold" style={{ color: '#0d1b35' }}>
                    {s.etudiant?.name ?? '—'}
                  </td>
                  <td className="max-w-[200px] truncate px-5 py-4 text-gray-600">{s.titre}</td>
                  <td className="px-5 py-4 text-gray-500">{s.filiere ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(s.date)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${STATUT_BADGE[s.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUT_LABELS[s.statut] ?? s.statut}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5 text-gray-400">
                      <button
                        onClick={() => navigate(`/secretaire/soutenances/${s.id}`)}
                        className="transition hover:text-indigo-600"
                        title="Voir le détail"
                      >
                        <EyeIcon />
                      </button>
                      {s.statut === 'planifiee' && (
                        <button
                          onClick={() => confirmMut.mutate(s.id)}
                          disabled={confirmMut.isPending}
                          className="transition hover:text-emerald-600"
                          title="Confirmer"
                        >
                          <CheckIcon />
                        </button>
                      )}
                      {!['annulee', 'realisee'].includes(s.statut) && (
                        <button
                          onClick={() => setConfirmCancel(s.id)}
                          className="transition hover:text-red-500"
                          title="Annuler"
                        >
                          <XIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {soutenances.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                    Aucune soutenance trouvée.
                  </td>
                </tr>
              )}
            </tbody>}
        </table>
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
