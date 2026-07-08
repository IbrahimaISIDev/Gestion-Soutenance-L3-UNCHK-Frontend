import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getUsers } from '../../api/users'
import { getSoutenances } from '../../api/soutenances'
import { getSalles } from '../../api/salles'
import { getAuditLogs } from '../../api/audit'

/* ── Donut chart SVG pur ── */
const ROLE_CHART_COLORS = {
  administrateur:          '#1e293b',
  secretaire_pedagogique:  '#1d4ed8',
  enseignant:              '#6366f1',
  etudiant:                '#22c55e',
  responsable_pedagogique: '#c9a227',
}
const ROLE_LABELS = {
  administrateur:          'Admin',
  secretaire_pedagogique:  'Secrétaire',
  enseignant:              'Enseignant',
  etudiant:                'Étudiant',
  responsable_pedagogique: 'Responsable',
}

function DonutChart({ segments, size = 168 }) {
  const cx = size / 2
  const cy = size / 2
  const r  = size * 0.295
  const sw = size * 0.155
  const circumference = 2 * Math.PI * r
  const total = segments.reduce((s, d) => s + d.value, 0)

  if (total === 0) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw} />
      </svg>
    )
  }

  let cumulative = 0
  return (
    <svg width={size} height={size}>
      <g transform={`rotate(-90 ${cx} ${cy})`}>
        {segments.map((seg, i) => {
          const dash    = (seg.value / total) * circumference
          const gap     = Math.min(2.5, dash * 0.12)
          const adjDash = Math.max(0, dash - gap)
          const offset  = -cumulative
          cumulative   += dash
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={sw}
              strokeDasharray={`${adjDash} ${circumference - adjDash}`}
              strokeDashoffset={offset}
            />
          )
        })}
      </g>
    </svg>
  )
}

/* ── Icônes inline ── */
function IconUsers() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IconBuilding() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 0 1 6 0v4"/>
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
function IconChevron() {
  return (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/* ── Mois courant ── */
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const now   = new Date()
const periodLabel = `${MOIS[now.getMonth()]} ${now.getFullYear()}`

export default function AdminDashboard() {
  const navigate = useNavigate()

  const { data: usersData }      = useQuery({ queryKey: ['users', 1], queryFn: () => getUsers(1) })
  const { data: soutenancesData }= useQuery({ queryKey: ['soutenances', 1], queryFn: () => getSoutenances(1) })
  const { data: sallesData }     = useQuery({ queryKey: ['salles', 1], queryFn: () => getSalles(1) })
  const { data: auditData }      = useQuery({ queryKey: ['audit', 1], queryFn: () => getAuditLogs(1) })

  const totalUsers      = usersData?.meta?.total ?? '—'
  const totalSoutenances= soutenancesData?.meta?.total ?? '—'

  const salles       = sallesData?.data ?? []
  const activeSalles = salles.filter((s) => s.actif).length
  const totalSalles  = sallesData?.meta?.total ?? salles.length

  const auditLogs = (auditData?.data ?? []).slice(0, 4)

  /* Répartition par rôle (depuis les utilisateurs chargés) */
  const usersPage = usersData?.data ?? []
  const roleCounts = usersPage.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1
    return acc
  }, {})
  const chartSegments = Object.entries(roleCounts).map(([role, value]) => ({
    role,
    value,
    color: ROLE_CHART_COLORS[role] ?? '#9ca3af',
    label: ROLE_LABELS[role] ?? role,
  }))
  const chartTotal = chartSegments.reduce((s, d) => s + d.value, 0)

  return (
    <div>
      {/* En-tête */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Tableau de bord</h1>
        <p className="mt-0.5 text-sm text-gray-500">Vue d'ensemble de la plateforme — {periodLabel}</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Utilisateurs actifs */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm" style={{ borderLeftWidth: 4, borderLeftColor: '#c9a227' }}>
          <div className="mb-3 text-gray-400"><IconUsers /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>{totalUsers}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">Utilisateurs actifs</p>
          <p className="mt-0.5 text-xs text-gray-400">80 % connectés ce mois</p>
        </div>
        {/* Soutenances */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 text-gray-400"><IconCalendar /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>{totalSoutenances}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">Soutenances</p>
          <p className="mt-0.5 text-xs text-gray-400">Total cumulé</p>
        </div>
        {/* Salles actives */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 text-gray-400"><IconBuilding /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>{activeSalles || '—'}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">Salles actives</p>
          <p className="mt-0.5 text-xs text-gray-400">sur {totalSalles} disponibles</p>
        </div>
      </div>

      {/* ── Ligne 2 : Répartition + Actions rapides ── */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">

        {/* Répartition par rôle */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-gray-900">Répartition par rôle</p>
          <p className="mt-0.5 text-xs text-gray-400">{chartTotal} comptes actifs au total</p>

          <div className="mt-6 flex items-center gap-8">
            <DonutChart segments={chartSegments} />
            <ul className="space-y-2.5">
              {chartSegments.map((seg) => (
                <li key={seg.role} className="flex items-center gap-2.5 text-sm">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="w-24 text-gray-700">{seg.label}</span>
                  <span className="font-semibold text-gray-900">{seg.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-gray-900">Actions rapides</p>
          <p className="mt-0.5 text-xs text-gray-400">Raccourcis administratifs</p>

          <div className="mt-5 divide-y divide-gray-100">
            {[
              { label: 'Créer un utilisateur',    icon: <IconPlus />,     path: '/admin/users' },
              { label: 'Gérer les salles',        icon: <IconBuilding />, path: '/admin/salles' },
              { label: 'Planifier une soutenance',icon: <IconCalendar />, path: '/admin/planification' },
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

      {/* ── Journal d'activités ── */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-5">
          <p className="font-semibold text-gray-900">Journal d'activités</p>
          <p className="mt-0.5 text-xs text-gray-400">{auditLogs.length} événements récents</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-gray-100">
                {['Date', 'Heure', 'Acteur', 'Action'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                    Aucun événement enregistré.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(log.created_at)}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{formatTime(log.created_at)}</td>
                    <td className="px-6 py-4">
                      <span
                        className="font-semibold"
                        style={{ color: log.utilisateur?.role === 'enseignant' ? '#c9a227' : '#0d1b35' }}
                      >
                        {log.utilisateur?.name ?? 'Système'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{log.action}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
