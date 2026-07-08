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
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'

/* ── Statut soutenance ── */
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

/* ── Statut confirmation jury ── */
const JURY_CONFIRM_DOT = {
  en_attente: '#f59e0b',
  confirme:   '#10b981',
  refuse:     '#ef4444',
}
const JURY_CONFIRM_LABELS = {
  en_attente: 'En attente',
  confirme:   'Confirmé',
  refuse:     'Refusé',
}

/* ── Rôles jury ── */
const JURY_ROLES = [
  { value: 'president',   label: 'Président' },
  { value: 'directeur',   label: 'Directeur' },
  { value: 'rapporteur',  label: 'Rapporteur' },
  { value: 'membre',      label: 'Membre' },
]

/* ── Statut PV ── */
const PV_BADGE = {
  brouillon:      'bg-gray-100 text-gray-600',
  en_validation:  'border border-amber-200 bg-amber-50 text-amber-700',
  valide:         'border border-emerald-200 bg-emerald-50 text-emerald-700',
  signe:          'border border-purple-200 bg-purple-50 text-purple-700',
  archive:        'bg-gray-100 text-gray-500',
}
const PV_LABELS = {
  brouillon:     'Brouillon',
  en_validation: 'En validation',
  valide:        'Validé',
  signe:         'Signé',
  archive:       'Archivé',
}

const MENTIONS = ['', 'Passable', 'Assez bien', 'Bien', 'Très bien', 'Félicitations du jury']

/* ── Icons ── */
function IconArrow() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  )
}
function IconPlus() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function IconTrash() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/* ── Section card ── */
function Card({ title, children, action }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <p className="text-[13px] font-semibold uppercase tracking-widest text-gray-500">{title}</p>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

export default function SoutenanceDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const toast     = useToast()

  const [juryForm, setJuryForm]   = useState({ utilisateur_id: '', role: 'membre' })
  const [pvForm, setPvForm]       = useState({ note: '', mention: '', observations: '' })
  const [showPvForm, setShowPvForm] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['soutenance', id],
    queryFn: () => getSoutenance(id),
  })
  const { data: usersData } = useQuery({
    queryKey: ['users', 1],
    queryFn: () => getUsers(1),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['soutenance', id] })

  const confirmMut   = useMutation({ mutationFn: () => confirmSoutenance(id), onSuccess: () => { invalidate(); toast.success('Soutenance confirmée.') }, onError: (e) => toast.error(e?.response?.data?.message ?? 'Confirmation impossible.') })
  const cancelMut    = useMutation({ mutationFn: () => cancelSoutenance(id),  onSuccess: () => { invalidate(); toast.success('Soutenance annulée.'); navigate('/secretaire/soutenances') }, onError: () => toast.error('Erreur lors de l\'annulation.') })
  const addJuryMut   = useMutation({ mutationFn: () => addJury(id, juryForm), onSuccess: () => { invalidate(); setJuryForm({ utilisateur_id: '', role: 'membre' }); toast.success('Membre ajouté au jury.') }, onError: () => toast.error('Erreur lors de l\'ajout.') })
  const removeJuryMut= useMutation({ mutationFn: removeJury, onSuccess: () => { invalidate(); toast.success('Membre retiré du jury.') } })
  const createPvMut  = useMutation({ mutationFn: () => createPv(id, pvForm),  onSuccess: () => { invalidate(); setShowPvForm(false); toast.success('PV créé.') }, onError: () => toast.error('Erreur lors de la création du PV.') })
  const updatePvMut  = useMutation({ mutationFn: ({ pvId, ...body }) => updatePv(pvId, body), onSuccess: () => { invalidate(); toast.success('PV mis à jour.') } })
  const submitPvMut  = useMutation({ mutationFn: (pvId) => submitPv(pvId), onSuccess: () => { invalidate(); toast.success('PV soumis pour validation.') } })

  if (isLoading) {
    return <p className="px-2 py-10 text-sm text-gray-400">Chargement...</p>
  }
  if (isError) {
    return <p className="px-2 py-10 text-sm text-red-500">Erreur lors du chargement.</p>
  }

  const s = data.data
  const enseignants = (usersData?.data ?? []).filter((u) => u.role === 'enseignant')
  const peutModifierJury = ['brouillon', 'planifiee'].includes(s.statut)

  return (
    <div className="space-y-5">
      <ConfirmDialog
        open={confirmCancel}
        title="Annuler la soutenance"
        message="Annuler cette soutenance ? Les membres du jury et l'étudiant seront notifiés."
        confirmLabel="Confirmer l'annulation"
        confirmClass="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        onConfirm={() => { cancelMut.mutate(); setConfirmCancel(false) }}
        onCancel={() => setConfirmCancel(false)}
      />

      {/* ── Barre supérieure ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/secretaire/soutenances')}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800"
        >
          <IconArrow /> Retour aux soutenances
        </button>
        <div className="flex items-center gap-3">
          <span className={`rounded px-3 py-1 text-[11px] font-bold tracking-wide ${STATUT_BADGE[s.statut] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUT_LABELS[s.statut] ?? s.statut}
          </span>
          {s.statut === 'planifiee' && (
            <button
              onClick={() => confirmMut.mutate()}
              disabled={confirmMut.isPending}
              className="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: '#0d1b35' }}
            >
              {confirmMut.isPending ? 'Confirmation…' : 'Confirmer'}
            </button>
          )}
          {!['annulee', 'realisee'].includes(s.statut) && (
            <button
              onClick={() => setConfirmCancel(true)}
              disabled={cancelMut.isPending}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* ── Titre & résumé ── */}
      <div>
        <h1 className="text-[22px] font-bold leading-snug" style={{ color: '#0d1b35' }}>{s.titre}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {s.etudiant?.name ?? '—'} · {s.filiere ?? '—'} · {s.type ?? '—'}
        </p>
      </div>

      {/* ── Informations ── */}
      <Card title="Informations">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 text-sm">
          {[
            { label: 'Date',      value: formatDate(s.date) },
            { label: 'Heure',     value: s.heure ?? '—' },
            { label: 'Salle',     value: s.salle?.nom ?? <span className="text-gray-300">Non assignée</span> },
            { label: 'Directeur', value: s.directeur?.name ?? '—' },
            { label: 'Type',      value: s.type ? (s.type.charAt(0).toUpperCase() + s.type.slice(1)) : '—' },
            { label: 'Filière',   value: s.filiere ?? '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</dt>
              <dd className="font-medium text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* ── Composition du jury ── */}
      <Card
        title="Composition du jury"
        action={
          peutModifierJury && (
            <span className="text-xs text-gray-400">
              {(s.jury ?? []).length} membre{(s.jury ?? []).length !== 1 ? 's' : ''}
            </span>
          )
        }
      >
        {(s.jury ?? []).length === 0 ? (
          <p className="mb-4 text-sm text-gray-400">Aucun membre ajouté au jury.</p>
        ) : (
          <ul className="mb-5 divide-y divide-gray-50">
            {s.jury.map((j) => {
              const dot = JURY_CONFIRM_DOT[j.statut_confirmation] ?? '#9ca3af'
              return (
                <li key={j.id} className="flex items-center gap-4 py-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: '#0d1b35' }}
                  >
                    {(j.utilisateur?.name ?? '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{j.utilisateur?.name ?? '—'}</p>
                    <p className="text-xs text-gray-500">
                      {JURY_ROLES.find((r) => r.value === j.role)?.label ?? j.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
                    <span style={{ color: dot }}>{JURY_CONFIRM_LABELS[j.statut_confirmation] ?? j.statut_confirmation}</span>
                  </div>
                  {peutModifierJury && (
                    <button
                      onClick={() => removeJuryMut.mutate(j.id)}
                      disabled={removeJuryMut.isPending}
                      className="text-gray-300 transition hover:text-red-500"
                      title="Retirer"
                    >
                      <IconTrash />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {peutModifierJury && (
          <div className="flex gap-2">
            <select
              className="input flex-1"
              value={juryForm.utilisateur_id}
              onChange={(e) => setJuryForm((f) => ({ ...f, utilisateur_id: e.target.value }))}
            >
              <option value="">Sélectionner un enseignant</option>
              {enseignants.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <select
              className="input"
              value={juryForm.role}
              onChange={(e) => setJuryForm((f) => ({ ...f, role: e.target.value }))}
            >
              {JURY_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <button
              onClick={() => addJuryMut.mutate()}
              disabled={!juryForm.utilisateur_id || addJuryMut.isPending}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              style={{ backgroundColor: '#0d1b35' }}
            >
              <IconPlus /> Ajouter
            </button>
          </div>
        )}
      </Card>

      {/* ── Procès-verbal ── */}
      <Card title="Procès-verbal">
        {s.pv ? (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className={`rounded px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${PV_BADGE[s.pv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {PV_LABELS[s.pv.status] ?? s.pv.status}
              </span>
            </div>
            <dl className="mb-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Note</dt>
                <dd className="text-2xl font-bold" style={{ color: '#0d1b35' }}>{s.pv.note ?? '—'}<span className="text-sm font-normal text-gray-400"> / 20</span></dd>
              </div>
              <div>
                <dt className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Mention</dt>
                <dd className="font-semibold text-gray-800">{s.pv.mention ?? '—'}</dd>
              </div>
              {s.pv.observations && (
                <div className="col-span-2">
                  <dt className="mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Observations</dt>
                  <dd className="text-gray-600">{s.pv.observations}</dd>
                </div>
              )}
            </dl>

            {s.pv.status === 'brouillon' && (
              <div className="flex gap-3">
                <button
                  onClick={() => submitPvMut.mutate(s.pv.id)}
                  disabled={submitPvMut.isPending}
                  className="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: '#0d1b35' }}
                >
                  {submitPvMut.isPending ? 'Envoi…' : 'Soumettre pour validation'}
                </button>
              </div>
            )}
          </div>
        ) : showPvForm ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                  Note <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0" max="20" step="0.5"
                  className="input w-full"
                  placeholder="Ex : 16.5"
                  value={pvForm.note}
                  onChange={(e) => setPvForm((f) => ({ ...f, note: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">Mention</label>
                <select
                  className="input w-full"
                  value={pvForm.mention}
                  onChange={(e) => setPvForm((f) => ({ ...f, mention: e.target.value }))}
                >
                  {MENTIONS.map((m) => <option key={m} value={m}>{m || 'Sélectionner…'}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">Observations</label>
              <textarea
                className="input w-full"
                rows={3}
                placeholder="Remarques du jury..."
                value={pvForm.observations}
                onChange={(e) => setPvForm((f) => ({ ...f, observations: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => createPvMut.mutate()}
                disabled={!pvForm.note || createPvMut.isPending}
                className="rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                style={{ backgroundColor: '#0d1b35' }}
              >
                {createPvMut.isPending ? 'Enregistrement…' : 'Enregistrer le PV'}
              </button>
              <button
                onClick={() => setShowPvForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-gray-400">Aucun procès-verbal créé pour cette soutenance.</p>
            {s.statut !== 'annulee' && (
              <button
                onClick={() => setShowPvForm(true)}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-800"
              >
                <IconPlus /> Créer le procès-verbal
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
