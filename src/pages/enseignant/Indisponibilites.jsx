import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getIndisponibilites, createIndisponibilite, updateIndisponibilite, deleteIndisponibilite } from '../../api/indisponibilites'

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
function IconArrow() {
  return (
    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function IndispoModal({ initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    initial ?? { date_debut: '', date_fin: '', motif: '' }
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-5 text-lg font-bold" style={{ color: '#0d1b35' }}>
          {initial ? "Modifier l'indisponibilité" : 'Nouvelle indisponibilité'}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Date de début <span className="text-red-400">*</span>
            </label>
            <input className="input w-full" type="date" value={form.date_debut} onChange={set('date_debut')} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Date de fin <span className="text-red-400">*</span>
            </label>
            <input className="input w-full" type="date" value={form.date_fin} onChange={set('date_fin')} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">Motif</label>
            <input
              className="input w-full"
              placeholder="Congé, déplacement, maladie…"
              value={form.motif}
              onChange={set('motif')}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.date_debut || !form.date_fin}
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

export default function Indisponibilites() {
  const [modal, setModal] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['indisponibilites'],
    queryFn: getIndisponibilites,
  })

  const create = useMutation({
    mutationFn: createIndisponibilite,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['indisponibilites'] }); setModal(null) },
  })
  const update = useMutation({
    mutationFn: ({ id, ...body }) => updateIndisponibilite(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['indisponibilites'] }); setModal(null) },
  })
  const remove = useMutation({
    mutationFn: deleteIndisponibilite,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['indisponibilites'] }),
  })

  const indispos = data?.data ?? []

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Mes indisponibilités</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {indispos.length} créneau{indispos.length !== 1 ? 'x' : ''} déclaré{indispos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({})}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white"
          style={{ backgroundColor: '#0d1b35' }}
        >
          + Ajouter
        </button>
      </div>

      {modal !== null && (
        <IndispoModal
          initial={modal.id ? modal : null}
          saving={create.isPending || update.isPending}
          onClose={() => setModal(null)}
          onSave={(form) => modal.id ? update.mutate({ id: modal.id, ...form }) : create.mutate(form)}
        />
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400">Chargement...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['#', 'Période', 'Motif', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {indispos.map((item, i) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium" style={{ color: '#0d1b35' }}>
                      <span>{formatDate(item.date_debut)}</span>
                      <IconArrow />
                      <span>{formatDate(item.date_fin)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.motif || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <button
                        onClick={() => setModal(item)}
                        className="transition hover:text-indigo-600"
                        title="Modifier"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => { if (window.confirm('Supprimer cette indisponibilité ?')) remove.mutate(item.id) }}
                        disabled={remove.isPending}
                        className="transition hover:text-red-500"
                        title="Supprimer"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {indispos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                    Aucune indisponibilité déclarée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
