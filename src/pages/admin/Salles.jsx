import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSalles, createSalle, updateSalle, deleteSalle } from '../../api/salles'

function SalleModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(
    initial ?? { nom: '', capacite: '', localisation: '', equipements: '', actif: true }
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-gray-900">{initial ? 'Modifier' : 'Nouvelle'} salle</h2>
        <div className="space-y-3">
          <input className="input w-full" placeholder="Nom de la salle" value={form.nom} onChange={set('nom')} />
          <input className="input w-full" placeholder="Capacité" type="number" value={form.capacite} onChange={set('capacite')} />
          <input className="input w-full" placeholder="Localisation" value={form.localisation} onChange={set('localisation')} />
          <textarea className="input w-full" placeholder="Équipements (optionnel)" rows={3} value={form.equipements} onChange={set('equipements')} />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.actif} onChange={(e) => setForm(f => ({ ...f, actif: e.target.checked }))} />
            Salle active
          </label>
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

export default function AdminSalles() {
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['salles', page], queryFn: () => getSalles(page) })

  const create = useMutation({ mutationFn: createSalle, onSuccess: () => { qc.invalidateQueries({ queryKey: ['salles'] }); setModal(null) } })
  const update = useMutation({ mutationFn: ({ id, ...body }) => updateSalle(id, body), onSuccess: () => { qc.invalidateQueries({ queryKey: ['salles'] }); setModal(null) } })
  const remove = useMutation({ mutationFn: deleteSalle, onSuccess: () => qc.invalidateQueries({ queryKey: ['salles'] }) })

  if (isLoading) return <p className="text-gray-500">Chargement...</p>
  const { data: salles, meta } = data

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Salles</h1>
        <button onClick={() => setModal({})} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          + Nouvelle salle
        </button>
      </div>

      {modal !== null && (
        <SalleModal
          initial={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={(form) => modal.id ? update.mutate({ id: modal.id, ...form }) : create.mutate(form)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {salles.map((s) => (
          <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{s.nom}</p>
                <p className="text-sm text-gray-500">{s.localisation ?? 'Localisation non renseignée'}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {s.actif ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">Capacité : {s.capacite} places</p>
            {s.equipements && <p className="mt-1 text-xs text-gray-400">{s.equipements}</p>}
            <div className="mt-4 flex gap-3">
              <button onClick={() => setModal(s)} className="text-xs text-primary-600 hover:underline">Modifier</button>
              <button
                onClick={() => { if (window.confirm(`Supprimer ${s.nom} ?`)) remove.mutate(s.id) }}
                className="text-xs text-red-500 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {meta && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>{meta.from}–{meta.to} sur {meta.total}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Précédent</button>
            <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}
    </div>
  )
}
