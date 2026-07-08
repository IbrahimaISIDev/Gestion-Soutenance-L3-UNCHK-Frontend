import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getMesJurys } from '../../api/jury'

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
const ROLE_LABELS = {
  president:  'Président',
  directeur:  'Directeur',
  rapporteur: 'Rapporteur',
  membre:     'Membre',
}

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const now = new Date()
const periodLabel = `${MOIS[now.getMonth()]} ${now.getFullYear()}`

function IconUsers() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
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
function IconCheck() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}
function IconAlert() {
  return (
    <svg className="h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
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
function IconCalendar() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IconSlash() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
  )
}

function formatDateShort(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function EnseignantDashboard() {
  const navigate = useNavigate()
  const { data } = useQuery({ queryKey: ['mes-jurys'], queryFn: getMesJurys })

  const jurys     = data?.data ?? []
  const total     = jurys.length
  const enAttente = jurys.filter((j) => j.statut_confirmation === 'en_attente').length
  const confirmes = jurys.filter((j) => j.statut_confirmation === 'confirme').length

  const prochains = [...jurys]
    .filter((j) => j.soutenance?.date)
    .sort((a, b) => new Date(a.soutenance.date) - new Date(b.soutenance.date))
    .slice(0, 5)

  return (
    <div>
      {/* En-tête */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Tableau de bord</h1>
        <p className="mt-0.5 text-sm text-gray-500">Espace enseignant — {periodLabel}</p>
      </div>

      {/* Alerte jurys en attente */}
      {enAttente > 0 && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-3 text-sm text-amber-800">
            <IconAlert />
            <span>
              Vous avez <strong>{enAttente}</strong> invitation{enAttente > 1 ? 's' : ''} au jury en attente de réponse.
            </span>
          </div>
          <button
            onClick={() => navigate('/enseignant/jury')}
            className="ml-4 shrink-0 rounded-lg border border-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
          >
            Répondre →
          </button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm" style={{ borderLeftWidth: 4, borderLeftColor: '#c9a227' }}>
          <div className="mb-3 text-gray-400"><IconUsers /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>{total}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">Participations jury</p>
          <p className="mt-0.5 text-xs text-gray-400">Toutes soutenances</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 text-gray-400"><IconClock /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>{enAttente}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">En attente</p>
          <p className="mt-0.5 text-xs text-gray-400">Invitations sans réponse</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 text-gray-400"><IconCheck /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>{confirmes}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">Confirmées</p>
          <p className="mt-0.5 text-xs text-gray-400">Participations acceptées</p>
        </div>
      </div>

      {/* ── Ligne 2 : Prochains jurys + Actions ── */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">

        {/* Prochains jurys */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="font-semibold text-gray-900">Prochains jurys</p>
              <p className="mt-0.5 text-xs text-gray-400">Soutenances à venir</p>
            </div>
            <button
              onClick={() => navigate('/enseignant/jury')}
              className="text-xs font-medium" style={{ color: '#c9a227' }}
            >
              Voir tout →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100">
                  {['Soutenance', 'Date', 'Rôle', 'Statut'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {prochains.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                      Aucune participation prévue.
                    </td>
                  </tr>
                ) : (
                  prochains.map((j) => (
                    <tr key={j.id} className="hover:bg-gray-50">
                      <td className="max-w-[160px] truncate px-6 py-4 font-semibold" style={{ color: '#0d1b35' }}>
                        {j.soutenance?.titre ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDateShort(j.soutenance?.date)}</td>
                      <td className="px-6 py-4 text-gray-600 capitalize">{ROLE_LABELS[j.role] ?? j.role}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUT_BADGE[j.statut_confirmation] ?? 'bg-gray-100 text-gray-500'}`}>
                          {STATUT_LABELS[j.statut_confirmation] ?? j.statut_confirmation}
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
          <p className="mt-0.5 text-xs text-gray-400">Raccourcis enseignant</p>
          <div className="mt-5 divide-y divide-gray-100">
            {[
              { label: 'Mes jurys',            icon: <IconCalendar />, path: '/enseignant/jury' },
              { label: 'Mes indisponibilités', icon: <IconSlash />,    path: '/enseignant/indisponibilites' },
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
