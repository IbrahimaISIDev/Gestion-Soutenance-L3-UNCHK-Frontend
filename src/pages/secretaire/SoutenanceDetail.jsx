import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSoutenance,
  addJury,
  removeJury,
  confirmSoutenance,
  cancelSoutenance,
  createPv,
  updatePv,
  submitPv,
} from '../../api/soutenances'
import { getUsers } from '../../api/users'

const STATUT_COLORS = {
  brouillon: 'bg-gray-100 text-gray-700',
  planifiee: 'bg-blue-100 text-blue-700',
  confirmee: 'bg-green-100 text-green-700',
  realisee: 'bg-purple-100 text-purple-700',
  annulee: 'bg-red-100 text-red-700',
}

const JURY_ROLES = ['president', 'directeur', 'rapporteur', 'membre']

export default function SoutenanceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [juryForm, setJuryForm] = useState({ utilisateur_id: '', role: 'membre' })
  const [pvForm, setPvForm] = useState({ note: '', mention: '', observations: '' })
  const [showPvForm, setShowPvForm] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['soutenance', id],
    queryFn: () => getSoutenance(id),
  })

  const { data: usersData } = useQuery({
    queryKey: ['users', 1],
    queryFn: () => getUsers(1),
  })

  const confirm = useMutation({
    mutationFn: () => confirmSoutenance(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['soutenance', id] }),
  })
  const cancel = useMutation({
    mutationFn: () => cancelSoutenance(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['soutenance', id] }); navigate('/secretaire/soutenances') },
  })
  const addJuryMut = useMutation({
    mutationFn: () => addJury(id, juryForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['soutenance', id] }); setJuryForm({ utilisateur_id: '', role: 'membre' }) },
  })
  const removeJuryMut = useMutation({
    mutationFn: removeJury,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['soutenance', id] }),
  })
  const createPvMut = useMutation({
    mutationFn: () => createPv(id, pvForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['soutenance', id] }); setShowPvForm(false) },
  })
  const updatePvMut = useMutation({
    mutationFn: ({ pvId, ...body }) => updatePv(pvId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['soutenance', id] }),
  })
  const submitPvMut = useMutation({
    mutationFn: (pvId) => submitPv(pvId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['soutenance', id] }),
  })

  if (isLoading) return <p className="text-gray-500">Chargement...</p>
  if (isError) return <p className="text-red-500">Erreur lors du chargement.</p>

  const s = data.data
  const enseignants = (usersData?.data ?? []).filter((u) => u.role === 'enseignant')

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{s.titre}</h1>
          <p className="mt-1 text-sm text-gray-500">{s.filiere} · {s.type} · {s.etudiant?.name}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUT_COLORS[s.statut]}`}>
          {s.statut}
        </span>
      </div>

      {/* Actions principales */}
      <div className="flex flex-wrap gap-3">
        {s.statut === 'planifiee' && (
          <button onClick={() => confirm.mutate()} disabled={confirm.isPending}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
            Confirmer
          </button>
        )}
        {!['annulee', 'realisee'].includes(s.statut) && (
          <button
            onClick={() => { if (window.confirm('Annuler cette soutenance ?')) cancel.mutate() }}
            disabled={cancel.isPending}
            className="rounded-lg border border-red-400 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Annuler
          </button>
        )}
      </div>

      {/* Informations */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Informations</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-gray-500">Date</dt><dd className="text-gray-900">{s.date ?? 'Non définie'}</dd></div>
          <div><dt className="text-gray-500">Heure</dt><dd className="text-gray-900">{s.heure ?? 'Non définie'}</dd></div>
          <div><dt className="text-gray-500">Salle</dt><dd className="text-gray-900">{s.salle?.nom ?? 'Non assignée'}</dd></div>
          <div><dt className="text-gray-500">Directeur</dt><dd className="text-gray-900">{s.directeur?.name ?? '—'}</dd></div>
        </dl>
      </div>

      {/* Jury */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Membres du jury</h2>
        {(s.jury ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">Aucun membre ajouté.</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {s.jury.map((j) => (
              <li key={j.id} className="flex items-center justify-between text-sm">
                <span>
                  <span className="font-medium text-gray-900">{j.utilisateur?.name}</span>
                  <span className="ml-2 text-gray-500 capitalize">{j.role}</span>
                </span>
                <button onClick={() => removeJuryMut.mutate(j.id)} className="text-xs text-red-500 hover:underline">Retirer</button>
              </li>
            ))}
          </ul>
        )}
        {['brouillon', 'planifiee'].includes(s.statut) && (
          <div className="flex gap-2">
            <select
              className="input flex-1"
              value={juryForm.utilisateur_id}
              onChange={(e) => setJuryForm(f => ({ ...f, utilisateur_id: e.target.value }))}
            >
              <option value="">Sélectionner un enseignant</option>
              {enseignants.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select
              className="input"
              value={juryForm.role}
              onChange={(e) => setJuryForm(f => ({ ...f, role: e.target.value }))}
            >
              {JURY_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button
              onClick={() => addJuryMut.mutate()}
              disabled={!juryForm.utilisateur_id || addJuryMut.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              Ajouter
            </button>
          </div>
        )}
      </div>

      {/* PV */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-900">Procès-verbal</h2>
        {s.pv ? (
          <div className="text-sm space-y-1">
            <p><span className="text-gray-500">Note :</span> <span className="font-medium">{s.pv.note ?? '—'}</span></p>
            <p><span className="text-gray-500">Mention :</span> <span className="font-medium">{s.pv.mention ?? '—'}</span></p>
            <p><span className="text-gray-500">Statut :</span> <span className="font-medium capitalize">{s.pv.status}</span></p>
            {s.pv.observations && <p><span className="text-gray-500">Observations :</span> {s.pv.observations}</p>}
            {s.pv.status === 'brouillon' && (
              <button
                onClick={() => submitPvMut.mutate(s.pv.id)}
                disabled={submitPvMut.isPending}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                Soumettre pour validation
              </button>
            )}
          </div>
        ) : (
          <>
            {!showPvForm ? (
              <button onClick={() => setShowPvForm(true)} className="text-sm text-primary-600 hover:underline">
                + Créer le PV
              </button>
            ) : (
              <div className="space-y-3">
                <input className="input w-full" placeholder="Note (ex: 16.5)" type="number" step="0.5" value={pvForm.note} onChange={e => setPvForm(f => ({ ...f, note: e.target.value }))} />
                <input className="input w-full" placeholder="Mention" value={pvForm.mention} onChange={e => setPvForm(f => ({ ...f, mention: e.target.value }))} />
                <textarea className="input w-full" placeholder="Observations" rows={3} value={pvForm.observations} onChange={e => setPvForm(f => ({ ...f, observations: e.target.value }))} />
                <div className="flex gap-2">
                  <button onClick={() => createPvMut.mutate()} disabled={createPvMut.isPending}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60">
                    Enregistrer
                  </button>
                  <button onClick={() => setShowPvForm(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-600">Annuler</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
