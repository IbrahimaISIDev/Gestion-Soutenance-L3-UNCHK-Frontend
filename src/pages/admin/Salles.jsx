import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSalles, createSalle, updateSalle, deleteSalle } from '../../api/salles'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import TableSkeleton from '../../components/TableSkeleton'

function PencilIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}
function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
      <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function SalleModal({ initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    initial ?? { nom: '', capacite: '', localisation: '', equipements: '', actif: true }
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-5 text-lg font-bold" style={{ color: '#0d1b35' }}>
          {initial ? 'Modifier la salle' : 'Nouvelle salle'}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">Nom de la salle *</label>
            <input className="input w-full" placeholder="Ex : Amphi A" value={form.nom} onChange={set('nom')} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">Capacité *</label>
            <input className="input w-full" type="number" placeholder="200" value={form.capacite} onChange={set('capacite')} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">Localisation</label>
            <input className="input w-full" placeholder="Bâtiment A — RDC" value={form.localisation} onChange={set('localisation')} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">Équipements</label>
            <textarea className="input w-full" rows={2} placeholder="Vidéoprojecteur, micro…" value={form.equipements} onChange={set('equipements')} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 select-none">
            <input type="checkbox" checked={form.actif} onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))} className="h-4 w-4 rounded border-gray-300" />
            Salle active
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: '#0d1b35' }}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminSalles() {
  const [page, setPage]   = useState(1)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const qc = useQueryClient()
  const toast = useToast()

  const { data, isLoading } = useQuery({ queryKey: ['salles', page], queryFn: () => getSalles(page) })

  const create = useMutation({ mutationFn: createSalle, onSuccess: () => { qc.invalidateQueries({ queryKey: ['salles'] }); setModal(null); toast.success('Salle créée.') }, onError: () => toast.error('Erreur lors de la création.') })
  const update = useMutation({ mutationFn: ({ id, ...body }) => updateSalle(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['salles'] }); setModal(null); toast.success('Salle mise à jour.') }, onError: () => toast.error('Erreur lors de la modification.') })
  const remove = useMutation({ mutationFn: deleteSalle, onSuccess: () => { qc.invalidateQueries({ queryKey: ['salles'] }); toast.success('Salle supprimée.') }, onError: (e) => toast.error(e?.response?.data?.message ?? 'Suppression impossible.') })

  const salles = useMemo(() => {
    const list = data?.data ?? []
    if (!search) return list
    return list.filter((s) =>
      s.nom.toLowerCase().includes(search.toLowerCase()) ||
      (s.localisation ?? '').toLowerCase().includes(search.toLowerCase())
    )
  }, [data, search])

  const meta = data?.meta
  const active = (data?.data ?? []).filter((s) => s.actif).length
  const total  = meta?.total ?? (data?.data ?? []).length

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Gestion des salles</h1>
          <p className="mt-0.5 text-sm text-gray-500">{total} salles enregistrées — {active} actives</p>
        </div>
        <button
          onClick={() => setModal({})}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white"
          style={{ backgroundColor: '#0d1b35' }}
        >
          + Ajouter une salle
        </button>
      </div>

      {modal !== null && (
        <SalleModal
          initial={modal.id ? modal : null}
          saving={create.isPending || update.isPending}
          onClose={() => setModal(null)}
          onSave={(form) => modal.id ? update.mutate({ id: modal.id, ...form }) : create.mutate(form)}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Supprimer la salle"
        message={`Supprimer ${confirm?.nom} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        confirmClass="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        onConfirm={() => { remove.mutate(confirm.id); setConfirm(null) }}
        onCancel={() => setConfirm(null)}
      />

      {/* Barre de recherche */}
      <div className="mb-4">
        <div className="relative w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input
            className="input w-full pl-9"
            placeholder="Rechercher une salle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['#', 'Nom', 'Capacité', 'Localisation', 'Statut', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {isLoading ? (
            <TableSkeleton cols={6} rows={6} />
          ) : (
            <tbody className="divide-y divide-gray-50">
              {salles.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {String(((page - 1) * 15) + i + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4 font-semibold" style={{ color: '#0d1b35' }}>{s.nom}</td>
                  <td className="px-6 py-4 font-medium text-gray-700">{s.capacite} places</td>
                  <td className="px-6 py-4 text-gray-500">{s.localisation ?? '—'}</td>
                  <td className="px-6 py-4">
                    {s.actif ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <button onClick={() => setModal(s)} className="transition hover:text-indigo-600" title="Modifier">
                        <PencilIcon />
                      </button>
                      <button onClick={() => setConfirm(s)} className="transition hover:text-red-500" title="Supprimer">
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {salles.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">Aucune salle trouvée.</td></tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="mt-5 flex items-center gap-2">
          {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition"
              style={p === page ? { backgroundColor: '#0d1b35', color: '#fff' } : { color: '#374151' }}
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
