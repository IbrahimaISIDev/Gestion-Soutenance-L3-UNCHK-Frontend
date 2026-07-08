import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getSoutenances } from '../../api/soutenances'

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

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const now = new Date()
const periodLabel = `${MOIS[now.getMonth()]} ${now.getFullYear()}`

function IconCalendar() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}
function IconClock() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
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
function IconList() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}
function IconBell() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}
function IconChevron() {
  return (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function SecretaireDashboard() {
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ['soutenances', 1],
    queryFn: () => getSoutenances(1),
  })

  const soutenances = data?.data ?? []
  const total       = data?.meta?.total ?? '—'
  const planifiees  = soutenances.filter((s) => s.statut === 'planifiee').length
  const confirmees  = soutenances.filter((s) => s.statut === 'confirmee').length
  const recentes    = soutenances.slice(0, 5)

  return (
    <div>
      {/* En-tête */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Tableau de bord</h1>
        <p className="mt-0.5 text-sm text-gray-500">Secrétariat pédagogique — {periodLabel}</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm" style={{ borderLeftWidth: 4, borderLeftColor: '#c9a227' }}>
          <div className="mb-3 text-gray-400"><IconCalendar /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>{total}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">Total soutenances</p>
          <p className="mt-0.5 text-xs text-gray-400">Toutes promotions confondues</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 text-gray-400"><IconClock /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>{planifiees}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">À confirmer</p>
          <p className="mt-0.5 text-xs text-gray-400">Soutenances planifiées en attente</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 text-gray-400"><IconCheck /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>{confirmees}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">Confirmées</p>
          <p className="mt-0.5 text-xs text-gray-400">Prêtes à être tenues</p>
        </div>
      </div>

      {/* ── Ligne 2 : Soutenances récentes + Actions ── */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">

        {/* Soutenances récentes */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="font-semibold text-gray-900">Soutenances récentes</p>
              <p className="mt-0.5 text-xs text-gray-400">{recentes.length} dernières entrées</p>
            </div>
            <button
              onClick={() => navigate('/secretaire/soutenances')}
              className="text-xs font-medium" style={{ color: '#c9a227' }}
            >
              Voir tout →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100">
                  {['Étudiant', 'Titre', 'Date', 'Statut'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                      Aucune soutenance enregistrée.
                    </td>
                  </tr>
                ) : (
                  recentes.map((s) => (
                    <tr
                      key={s.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/secretaire/soutenances/${s.id}`)}
                    >
                      <td className="px-6 py-4 font-semibold" style={{ color: '#0d1b35' }}>
                        {s.etudiant?.name ?? '—'}
                      </td>
                      <td className="max-w-[200px] truncate px-6 py-4 text-gray-600">{s.titre}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(s.date)}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${STATUT_BADGE[s.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                          {STATUT_LABELS[s.statut] ?? s.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-gray-900">Actions rapides</p>
          <p className="mt-0.5 text-xs text-gray-400">Raccourcis secrétariat</p>

          <div className="mt-5 divide-y divide-gray-100">
            {[
              { label: 'Planifier une soutenance', icon: <IconPlus />,    path: '/secretaire/planification' },
              { label: 'Gérer les soutenances',    icon: <IconList />,    path: '/secretaire/soutenances' },
              { label: 'Notifications',            icon: <IconBell />,    path: '/notifications' },
            ].map(({ label, icon, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="flex w-full items-center gap-3 py-3.5 text-left text-sm text-gray-700 transition hover:text-gray-900"
              >
                <span style={{ color: '#c9a227' }}>{icon}</span>
                <span className="flex-1 font-medium">{label}</span>
                <IconChevron />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
