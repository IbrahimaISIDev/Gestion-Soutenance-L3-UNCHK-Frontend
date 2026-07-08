import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV_BY_ROLE = {
  administrateur: [
    { to: '/admin', label: 'Tableau de bord' },
    { to: '/admin/users', label: 'Utilisateurs' },
    { to: '/admin/salles', label: 'Salles' },
    { to: '/admin/audit', label: 'Journal d\'audit' },
  ],
  secretaire_pedagogique: [
    { to: '/secretaire', label: 'Tableau de bord' },
    { to: '/secretaire/soutenances', label: 'Soutenances' },
  ],
  enseignant: [
    { to: '/enseignant', label: 'Tableau de bord' },
    { to: '/enseignant/jury', label: 'Mes jurys' },
    { to: '/enseignant/indisponibilites', label: 'Indisponibilités' },
  ],
  responsable_pedagogique: [
    { to: '/responsable', label: 'Tableau de bord' },
    { to: '/responsable/pv', label: 'Validation PV' },
  ],
  etudiant: [
    { to: '/etudiant', label: 'Tableau de bord' },
    { to: '/etudiant/soutenances', label: 'Ma soutenance' },
  ],
}

const ROLE_LABELS = {
  administrateur: 'Administrateur',
  secretaire_pedagogique: 'Secrétaire pédagogique',
  enseignant: 'Enseignant',
  responsable_pedagogique: 'Responsable pédagogique',
  etudiant: 'Étudiant',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navLinks = NAV_BY_ROLE[user?.role] ?? []

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-gray-900 text-white">
        <div className="px-6 py-5">
          <span className="text-lg font-bold tracking-tight">GestSoutenance</span>
          <p className="mt-0.5 text-xs text-gray-400">{ROLE_LABELS[user?.role]}</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 pb-4">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split('/').length === 2}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            Notifications
          </NavLink>
        </nav>

        {/* User + logout */}
        <div className="border-t border-gray-700 p-4">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-gray-400">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-600"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
