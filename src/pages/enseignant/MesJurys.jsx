import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMesJurys, confirmJury, declineJury } from '../../api/jury'

const STATUT_STYLES = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  confirme: 'bg-green-100 text-green-700',
  refuse: 'bg-red-100 text-red-700',
}

export default function MesJurys() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['mes-jurys'],
    queryFn: getMesJurys,
  })

  const confirm = useMutation({
    mutationFn: confirmJury,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mes-jurys'] }),
  })

  const decline = useMutation({
    mutationFn: declineJury,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mes-jurys'] }),
  })

  if (isLoading) return <p className="text-gray-500">Chargement...</p>

  const jurys = data?.data ?? []

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">Mes participations au jury</h1>

      {jurys.length === 0 ? (
        <p className="text-gray-500">Aucune invitation en cours.</p>
      ) : (
        <div className="space-y-4">
          {jurys.map((j) => (
            <div key={j.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {j.soutenance?.titre ?? 'Soutenance #' + j.soutenance_id}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Rôle : <span className="capitalize">{j.role}</span>
                    {j.soutenance?.date && ` · ${j.soutenance.date}`}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${STATUT_STYLES[j.statut_confirmation]}`}>
                  {j.statut_confirmation.replace('_', ' ')}
                </span>
              </div>

              {j.statut_confirmation === 'en_attente' && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => confirm.mutate(j.id)}
                    disabled={confirm.isPending}
                    className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    Confirmer ma participation
                  </button>
                  <button
                    onClick={() => decline.mutate(j.id)}
                    disabled={decline.isPending}
                    className="rounded-lg border border-red-400 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
