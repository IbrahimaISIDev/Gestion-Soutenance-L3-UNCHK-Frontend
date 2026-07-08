import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSoutenances } from '../../api/soutenances'
import { validatePv, rejectPv } from '../../api/jury'

function RejectModal({ pvId, onClose, onConfirm }) {
  const [commentaire, setCommentaire] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-3 text-lg font-bold text-gray-900">Rejeter le PV</h2>
        <textarea
          className="input w-full"
          rows={4}
          placeholder="Motif du rejet (obligatoire)"
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
          <button
            disabled={!commentaire.trim()}
            onClick={() => onConfirm(commentaire)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ValidationPv() {
  const [page, setPage] = useState(1)
  const [rejectModal, setRejectModal] = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['soutenances-pv', page],
    queryFn: () => getSoutenances(page),
  })

  const validate = useMutation({
    mutationFn: validatePv,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['soutenances-pv'] }),
  })
  const reject = useMutation({
    mutationFn: ({ pvId, commentaire }) => rejectPv(pvId, commentaire),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['soutenances-pv'] }); setRejectModal(null) },
  })

  if (isLoading) return <p className="text-gray-500">Chargement...</p>

  const soutenances = (data?.data ?? []).filter((s) => s.pv?.status === 'en_validation')

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">Validation des PV</h1>

      {rejectModal && (
        <RejectModal
          pvId={rejectModal}
          onClose={() => setRejectModal(null)}
          onConfirm={(commentaire) => reject.mutate({ pvId: rejectModal, commentaire })}
        />
      )}

      {soutenances.length === 0 ? (
        <p className="text-gray-500">Aucun PV en attente de validation.</p>
      ) : (
        <div className="space-y-4">
          {soutenances.map((s) => (
            <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{s.titre}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{s.etudiant?.name} · {s.filiere}</p>
                  <p className="mt-1 text-sm">
                    <span className="text-gray-500">Note :</span>{' '}
                    <span className="font-medium">{s.pv?.note ?? '—'}</span>
                    {s.pv?.mention && <span className="ml-2 text-gray-500">({s.pv.mention})</span>}
                  </p>
                  {s.pv?.observations && (
                    <p className="mt-1 text-xs text-gray-400">{s.pv.observations}</p>
                  )}
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700">
                  En validation
                </span>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => validate.mutate(s.pv.id)}
                  disabled={validate.isPending}
                  className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                >
                  Valider
                </button>
                <button
                  onClick={() => setRejectModal(s.pv.id)}
                  className="rounded-lg border border-red-400 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
