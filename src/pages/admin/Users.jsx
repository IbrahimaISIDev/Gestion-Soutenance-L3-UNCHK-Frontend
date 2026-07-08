import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import TableSkeleton from '../../components/TableSkeleton'
import { useDebounce } from '../../hooks/useDebounce'

const ROLES_OPTIONS = [
  { value: '',                       label: 'Tous les rôles' },
  { value: 'administrateur',         label: 'Admin' },
  { value: 'secretaire_pedagogique', label: 'Secrétaire' },
  { value: 'enseignant',             label: 'Enseignant' },
  { value: 'etudiant',               label: 'Étudiant' },
  { value: 'responsable_pedagogique',label: 'Responsable' },
]

const ROLE_BADGE = {
  administrateur:          'bg-gray-900 text-white',
  secretaire_pedagogique:  'border border-sky-300 bg-sky-50 text-sky-700',
  enseignant:              'border border-indigo-300 bg-indigo-50 text-indigo-700',
  etudiant:                'border border-emerald-300 bg-emerald-50 text-emerald-700',
  responsable_pedagogique: 'border border-orange-300 bg-orange-50 text-orange-700',
}
const ROLE_SHORT = {
  administrateur:          'ADMIN',
  secretaire_pedagogique:  'SECRÉTAIRE',
  enseignant:              'ENSEIGNANT',
  etudiant:                'ÉTUDIANT',
  responsable_pedagogique: 'RESPONSABLE',
}

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

const ROLE_KEYS = ['administrateur','secretaire_pedagogique','enseignant','etudiant','responsable_pedagogique']

function UserModal({ initial, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    initial ?? { name: '', email: '', role: 'etudiant', password: '' }
  )
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-5 text-lg font-bold" style={{ color: '#0d1b35' }}>
          {initial ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">Nom complet *</label>
            <input className="input w-full" placeholder="Prénom Nom" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">Adresse email *</label>
            <input className="input w-full" type="email" placeholder="prenom.nom@univ.sn" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">Rôle *</label>
            <select className="input w-full" value={form.role} onChange={set('role')}>
              {ROLE_KEYS.map((r) => <option key={r} value={r}>{ROLE_SHORT[r]}</option>)}
            </select>
          </div>
          {!initial && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">Mot de passe *</label>
              <input className="input w-full" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
            </div>
          )}
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

export default function AdminUsers() {
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const debouncedSearch       = useDebounce(search)
  const [roleFilter, setRoleFilter] = useState('')
  const [modal, setModal]     = useState(null)
  const [confirm, setConfirm] = useState(null)
  const qc = useQueryClient()
  const toast = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => getUsers(page),
  })

  const create = useMutation({
    mutationFn: createUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(null); toast.success('Utilisateur créé.') },
    onError: () => toast.error('Erreur lors de la création.'),
  })
  const update = useMutation({
    mutationFn: ({ id, ...body }) => updateUser(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(null); toast.success('Utilisateur mis à jour.') },
    onError: () => toast.error('Erreur lors de la modification.'),
  })
  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Utilisateur supprimé.') },
    onError: () => toast.error('Erreur lors de la suppression.'),
  })

  const users = useMemo(() => {
    let list = data?.data ?? []
    if (debouncedSearch) list = list.filter((u) => u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || u.email.toLowerCase().includes(debouncedSearch.toLowerCase()))
    if (roleFilter) list = list.filter((u) => u.role === roleFilter)
    return list
  }, [data, debouncedSearch, roleFilter])

  const meta = data?.meta

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Gestion des utilisateurs</h1>
          <p className="mt-0.5 text-sm text-gray-500">{meta?.total ?? '—'} comptes enregistrés</p>
        </div>
        <button
          onClick={() => setModal({})}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white"
          style={{ backgroundColor: '#0d1b35' }}
        >
          + Ajouter un utilisateur
        </button>
      </div>

      {modal !== null && (
        <UserModal
          initial={modal.id ? modal : null}
          saving={create.isPending || update.isPending}
          onClose={() => setModal(null)}
          onSave={(form) => modal.id ? update.mutate({ id: modal.id, ...form }) : create.mutate(form)}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Supprimer l'utilisateur"
        message={`Supprimer définitivement ${confirm?.name} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        confirmClass="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        onConfirm={() => { remove.mutate(confirm.id); setConfirm(null) }}
        onCancel={() => setConfirm(null)}
      />

      <div className="mb-4 flex gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input
            className="input w-72 pl-9"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="input"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
        >
          {ROLES_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['#', 'Nom complet', 'Adresse email', 'Rôle', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {isLoading ? (
            <TableSkeleton cols={5} rows={8} />
          ) : (
            <tbody className="divide-y divide-gray-50">
              {users.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {String(((page - 1) * 15) + i + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4 font-semibold" style={{ color: '#0d1b35' }}>{u.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${ROLE_BADGE[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_SHORT[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <button onClick={() => setModal(u)} className="transition hover:text-indigo-600" title="Modifier">
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => setConfirm(u)}
                        className="transition hover:text-red-500" title="Supprimer"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">Aucun utilisateur trouvé.</td></tr>
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
