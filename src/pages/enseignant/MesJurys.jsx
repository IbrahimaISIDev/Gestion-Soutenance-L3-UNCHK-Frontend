import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMesJurys, confirmJury, declineJury } from '../../api/jury'
import { useToast } from '../../contexts/ToastContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import TableSkeleton from '../../components/TableSkeleton'

const STATUT_BADGE = {
  en_attente: 'border border-amber-300 bg-amber-50 text-amber-600',
  confirme:   'border border-emerald-200 bg-emerald-50 text-emerald-700',
  refuse:     'border border-red-200 bg-red-50 text-red-500',
}
const STATUT_LABELS = {
  en_attente: 'En attente',
  confirme:   'Confirmé',
  refuse:     'Refusé',
}
const ROLE_BADGE = {
  president:  'border border-indigo-200 bg-indigo-50 text-indigo-700',
  directeur:  'border border-sky-200 bg-sky-50 text-sky-700',
  rapporteur: 'border border-purple-200 bg-purple-50 text-purple-700',
  membre:     'bg-gray-100 text-gray-600',
}
const ROLE_LABELS = {
  president:  'Président',
  directeur:  'Directeur',
  rapporteur: 'Rapporteur',
  membre:     'Membre',
}

const FILTRE_OPTIONS = [
  { value: '',           label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirme',   label: 'Confirmé' },
  { value: 'refuse',     label: 'Refusé' },
]

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

function formatDateShort(iso) {
  if (!iso) return <span className="text-gray-300">—</span>
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function MesJurys() {
  const [filtre, setFiltre] = useState('')
  const [confirmDecline, setConfirmDecline] = useState(null)
  const qc = useQueryClient()
  const toast = useToast()

  const { data, isLoading } = useQuery({ queryKey: ['mes-jurys'], queryFn: getMesJurys })

  const confirmMut = useMutation({
    mutationFn: confirmJury,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mes-jurys'] }); toast.success('Participation confirmée.') },
    onError: () => toast.error('Erreur lors de la confirmation.'),
  })
  const decline = useMutation({
    mutationFn: declineJury,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mes-jurys'] }); toast.success('Invitation déclinée.') },
    onError: () => toast.error('Erreur lors du refus.'),
  })

  const jurys = useMemo(() => {
    const list = data?.data ?? []
    if (!filtre) return list
    return list.filter((j) => j.statut_confirmation === filtre)
  }, [data, filtre])

  const enAttente = (data?.data ?? []).filter((j) => j.statut_confirmation === 'en_attente').length

  const confirm = confirmMut

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Mes jurys</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {data?.data?.length ?? '—'} participation{(data?.data?.length ?? 0) !== 1 ? 's' : ''} au jury
          </p>
        </div>
        {enAttente > 0 && (
          <div className="rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700">
            {enAttente} en attente de réponse
          </div>
        )}
      </div>

      {/* Filtre */}
      <div className="mb-4">
        <select
          className="input"
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
        >
          {FILTRE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <ConfirmDialog
        open={!!confirmDecline}
        title="Décliner l'invitation"
        message="Refuser votre participation à ce jury ? Cette action ne peut pas être annulée."
        confirmLabel="Décliner"
        confirmClass="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
        onConfirm={() => { decline.mutate(confirmDecline); setConfirmDecline(null) }}
        onCancel={() => setConfirmDecline(null)}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['#', 'Soutenance', 'Étudiant', 'Date', 'Rôle', 'Statut', 'Actions'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          {isLoading ? <TableSkeleton cols={7} rows={5} /> : <tbody className="divide-y divide-gray-50">
              {jurys.map((j, i) => (
                <tr key={j.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 text-sm text-gray-400">
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <td className="max-w-[180px] truncate px-5 py-4 font-semibold" style={{ color: '#0d1b35' }}>
                    {j.soutenance?.titre ?? `Soutenance #${j.soutenance_id}`}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {j.soutenance?.etudiant?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {formatDateShort(j.soutenance?.date)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${ROLE_BADGE[j.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABELS[j.role] ?? j.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUT_BADGE[j.statut_confirmation] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUT_LABELS[j.statut_confirmation] ?? j.statut_confirmation}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {j.statut_confirmation === 'en_attente' ? (
                      <div className="flex items-center gap-2.5 text-gray-400">
                        <button
                          onClick={() => confirm.mutate(j.id)}
                          disabled={confirm.isPending}
                          title="Confirmer ma participation"
                          className="transition hover:text-emerald-600 disabled:opacity-40"
                        >
                          <CheckIcon />
                        </button>
                        <button
                          onClick={() => setConfirmDecline(j.id)}
                          disabled={decline.isPending}
                          title="Refuser"
                          className="transition hover:text-red-500 disabled:opacity-40"
                        >
                          <XIcon />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {jurys.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                    Aucune participation trouvée.
                  </td>
                </tr>
              )}
            </tbody>}
        </table>
      </div>
    </div>
  )
}
