import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/* ── Inline SVG icons ── */
const Icon = {
  grid: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  users: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  calendar: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  building: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 0 1 6 0v4"/>
    </svg>
  ),
  document: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  bell: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  chevronRight: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  logout: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  ),
}

const NAV_BY_ROLE = {
  administrateur: [
    { to: '/admin',              label: 'Tableau de bord',  icon: Icon.grid,     end: true },
    { to: '/admin/users',        label: 'Utilisateurs',     icon: Icon.users },
    { to: '/admin/planification',label: 'Planification',    icon: Icon.calendar },
    { to: '/admin/salles',       label: 'Salles',           icon: Icon.building },
  ],
  secretaire_pedagogique: [
    { to: '/secretaire',              label: 'Tableau de bord', icon: Icon.grid,     end: true },
    { to: '/secretaire/soutenances',  label: 'Soutenances',     icon: Icon.document },
    { to: '/secretaire/planification',label: 'Planification',   icon: Icon.calendar },
  ],
  enseignant: [
    { to: '/enseignant',                  label: 'Tableau de bord',   icon: Icon.grid,     end: true },
    { to: '/enseignant/jury',             label: 'Mes jurys',         icon: Icon.users },
    { to: '/enseignant/indisponibilites', label: 'Indisponibilités',  icon: Icon.calendar },
  ],
  responsable_pedagogique: [
    { to: '/responsable',     label: 'Tableau de bord', icon: Icon.grid,     end: true },
    { to: '/responsable/pv',  label: 'Validation PV',   icon: Icon.document },
  ],
  etudiant: [
    { to: '/etudiant',            label: 'Tableau de bord',  icon: Icon.grid,     end: true },
    { to: '/etudiant/soutenances',label: 'Ma soutenance',    icon: Icon.calendar },
  ],
}

const ROLE_LABELS = {
  administrateur:         'Administrateur',
  secretaire_pedagogique: 'Secrétaire pédagogique',
  enseignant:             'Enseignant',
  responsable_pedagogique:'Responsable pédagogique',
  etudiant:               'Étudiant',
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navLinks = NAV_BY_ROLE[user?.role] ?? []
  const initials = getInitials(user?.name)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f1f5f9' }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex w-[215px] shrink-0 flex-col"
        style={{ backgroundColor: '#0d1b35' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: '#c9a227' }}>
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-white">GestSoutenance</p>
            <p className="text-[11px]" style={{ color: '#64748b' }}>UNCHK</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {navLinks.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${
                  isActive
                    ? 'text-gold-500'
                    : 'text-slate-400 hover:text-white'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: 'rgba(255,255,255,0.08)', color: '#c9a227' }
                  : {}
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? '' : 'opacity-70'}>{icon}</span>
                  <span className="flex-1">{label}</span>
                  {isActive && <span style={{ color: '#c9a227' }}>{Icon.chevronRight}</span>}
                </>
              )}
            </NavLink>
          ))}

          {/* Notifications (tous rôles) */}
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all ${
                isActive ? '' : 'text-slate-400 hover:text-white'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { backgroundColor: 'rgba(255,255,255,0.08)', color: '#c9a227' }
                : {}
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? '' : 'opacity-70'}>{Icon.bell}</span>
                <span className="flex-1">Notifications</span>
                {isActive && <span style={{ color: '#c9a227' }}>{Icon.chevronRight}</span>}
              </>
            )}
          </NavLink>
        </nav>

        {/* User info + logout */}
        <div className="border-t px-4 py-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
              style={{ backgroundColor: '#c9a227' }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{user?.name}</p>
              <p className="truncate text-[11px]" style={{ color: '#64748b' }}>
                {ROLE_LABELS[user?.role]}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="shrink-0 text-slate-500 transition-colors hover:text-white"
            >
              {Icon.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
