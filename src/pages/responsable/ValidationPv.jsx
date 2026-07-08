import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPvs, validatePv, rejectPv } from '../../api/responsable'

const PV_STATUS_BADGE = {
  brouillon:     'bg-gray-100 text-gray-600',
  en_validation: 'border border-amber-200 bg-amber-50 text-amber-700',
  valide:        'border border-emerald-200 bg-emerald-50 text-emerald-700',
  signe:         'border border-purple-200 bg-purple-50 text-purple-700',
  archive:       'bg-gray-100 text-gray-500',
}
const PV_STATUS_LABELS = {
  brouillon:     'Brouillon',
  en_validation: 'En validation',
  valide:        'Validé',
  signe:         'Signé',
  archive:       'Archivé',
}

function IconArrow() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function IconX() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function RejectModal({ onClose, onConfirm, loading }) {
  const [commentaire, setCommentaire] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 text-lg font-bold" style={{ color: '#0d1b35' }}>Rejeter le PV</h2>
        <p className="mb-4 text-sm text-gray-500">Le motif de rejet sera transmis à la secrétaire pédagogique.</p>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          Motif du rejet <span className="text-red-400">*</span>
        </label>
        <textarea
          className="input w-full"
          rows={4}
          placeholder="Expliquer la raison du rejet..."
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
        />
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            disabled={!commentaire.trim() || loading}
            onClick={() => onConfirm(commentaire)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Rejet…' : 'Confirmer le rejet'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ValidationPv() {
  const navigate = useNavigate()
  const [page, setPage]         = useState(1)
  const [rejectModal, setRejectModal] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['pvs-responsable', page],
    queryFn: () => getPvs(page),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['pvs-responsable'] })

  const validateMut = useMutation({ mutationFn: validatePv, onSuccess: invalidate })
  const rejectMut   = useMutation({
    mutationFn: ({ id, commentaire }) => rejectPv(id, { commentaire }),
    onSuccess: () => { invalidate(); setRejectModal(null) },
  })

  const pvs = (data?.data ?? []).filter((p) => p.status === 'en_validation')
  const meta = data?.meta

  return (
    <div>
      {/* Barre de navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/responsable')}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800"
        >
          <IconArrow /> Tableau de bord
        </button>
        <span className="text-sm text-gray-400">
          {pvs.length} PV{pvs.length !== 1 ? 's' : ''} en attente
        </span>
      </div>

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Validation des PV</h1>
        <p className="mt-0.5 text-sm text-gray-500">Procès-verbaux soumis en attente de votre validation</p>
      </div>

      {rejectModal && (
        <RejectModal
          loading={rejectMut.isPending}
          onClose={() => setRejectModal(null)}
          onConfirm={(commentaire) => rejectMut.mutate({ id: rejectModal, commentaire })}
        />
      )}

      {isLoading ? (
        <p className="py-10 text-center text-sm text-gray-400">Chargement...</p>
      ) : pvs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-700">Aucun PV en attente de validation</p>
          <p className="mt-1 text-xs text-gray-400">Tous les procès-verbaux ont été traités.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pvs.map((pv) => (
            <div
              key={pv.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="truncate text-[15px] font-bold" style={{ color: '#0d1b35' }}>
                      {pv.soutenance?.titre ?? 'Titre non renseigné'}
                    </h3>
                    <span className={`shrink-0 rounded px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${PV_STATUS_BADGE[pv.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {PV_STATUS_LABELS[pv.status] ?? pv.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {pv.soutenance?.etudiant?.name ?? '—'} · {pv.soutenance?.filiere ?? '—'} · {pv.soutenance?.type ?? '—'}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Note</dt>
                      <dd className="mt-0.5 text-xl font-bold" style={{ color: '#0d1b35' }}>
                        {pv.note ?? '—'}<span className="text-xs font-normal text-gray-400"> / 20</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Mention</dt>
                      <dd className="mt-0.5 font-semibold text-gray-700">{pv.mention ?? '—'}</dd>
                    </div>
                    {pv.observations && (
                      <div className="col-span-2 sm:col-span-1">
                        <dt className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Observations</dt>
                        <dd className="mt-0.5 text-gray-600">{pv.observations}</dd>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
                <button
                  onClick={() => validateMut.mutate(pv.id)}
                  disabled={validateMut.isPending}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: '#0d1b35' }}
                >
                  <IconCheck /> Valider
                </button>
                <button
                  onClick={() => setRejectModal(pv.id)}
                  className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <IconX /> Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
