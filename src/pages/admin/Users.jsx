import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users'

const ROLES = ['administrateur', 'secretaire_pedagogique', 'enseignant', 'etudiant', 'responsable_pedagogique']

function UserModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial ?? { name: '', email: '', role: 'etudiant', password: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {initial ? 'Modifier' : 'Nouvel'} utilisateur
        </h2>
        <div className="space-y-3">
          <input className="input w-full" placeholder="Nom complet" value={form.name} onChange={set('name')} />
          <input className="input w-full" placeholder="Email" type="email" value={form.email} onChange={set('email')} />
          <select className="input w-full" value={form.role} onChange={set('role')}>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </select>
          {!initial && (
            <input className="input w-full" placeholder="Mot de passe" type="password" value={form.password} onChange={set('password')} />
          )}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
          <button
            onClick={() => onSave(form)}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['users', page], queryFn: () => getUsers(page) })

  const create = useMutation({
    mutationFn: createUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(null) },
  })
  const update = useMutation({
    mutationFn: ({ id, ...body }) => updateUser(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(null) },
  })
  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  const handleSave = (form) => {
    if (modal.id) update.mutate({ id: modal.id, ...form })
    else create.mutate(form)
  }

  if (isLoading) return <p className="text-gray-500">Chargement...</p>
  const { data: users, meta } = data

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Utilisateurs</h1>
        <button
          onClick={() => setModal({})}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          + Nouvel utilisateur
        </button>
      </div>

      {modal !== null && (
        <UserModal
          initial={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{u.role?.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => setModal(u)} className="text-xs text-primary-600 hover:underline">
                      Modifier
                    </button>
                    <button
                      onClick={() => { if (window.confirm(`Supprimer ${u.name} ?`)) remove.mutate(u.id) }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
