import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getIndisponibilites, createIndisponibilite, updateIndisponibilite, deleteIndisponibilite } from '../../api/indisponibilites'

function IndispoModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? { date_debut: '', date_fin: '', motif: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-gray-900">{initial ? 'Modifier' : 'Nouvelle'} indisponibilité</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Date de début</label>
            <input className="input w-full" type="date" value={form.date_debut} onChange={set('date_debut')} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Date de fin</label>
            <input className="input w-full" type="date" value={form.date_fin} onChange={set('date_fin')} />
          </div>
          <input className="input w-full" placeholder="Motif (optionnel)" value={form.motif} onChange={set('motif')} />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
          <button onClick={() => onSave(form)} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Indisponibilites() {
  const [modal, setModal] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['indisponibilites'], queryFn: getIndisponibilites })

  const create = useMutation({ mutationFn: createIndisponibilite, onSuccess: () => { qc.invalidateQueries({ queryKey: ['indisponibilites'] }); setModal(null) } })
  const update = useMutation({ mutationFn: ({ id, ...body }) => updateIndisponibilite(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['indisponibilites'] }); setModal(null) } })
  const remove = useMutation({ mutationFn: deleteIndisponibilite, onSuccess: () => qc.invalidateQueries({ queryKey: ['indisponibilites'] }) })

  if (isLoading) return <p className="text-gray-500">Chargement...</p>
  const indispos = data?.data ?? []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mes indisponibilités</h1>
        <button onClick={() => setModal({})} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + Ajouter
        </button>
      </div>

      {modal !== null && (
        <IndispoModal
          initial={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={(form) => modal.id ? update.mutate({ id: modal.id, ...form }) : create.mutate(form)}
        />
      )}

      {indispos.length === 0 ? (
        <p className="text-gray-500">Aucune indisponibilité déclarée.</p>
      ) : (
        <div className="space-y-3">
          {indispos.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-gray-900">
                  {i.date_debut} → {i.date_fin}
                </p>
                {i.motif && <p className="text-sm text-gray-500">{i.motif}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setModal(i)} className="text-xs text-primary-600 hover:underline">Modifier</button>
                <button
                  onClick={() => { if (window.confirm('Supprimer cette indisponibilité ?')) remove.mutate(i.id) }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
