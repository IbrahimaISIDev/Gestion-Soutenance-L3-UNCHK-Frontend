import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../../api/users'
import { getSoutenances } from '../../api/soutenances'
import { Link } from 'react-router-dom'

function StatCard({ label, value, to, color = 'primary' }) {
  const colorMap = {
    primary: 'border-primary-200 bg-primary-50 text-primary-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    red: 'border-red-200 bg-red-50 text-red-700',
  }
  const card = (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value ?? '…'}</p>
    </div>
  )
  return to ? <Link to={to}>{card}</Link> : card
}

export default function AdminDashboard() {
  const { data: usersData } = useQuery({ queryKey: ['users', 1], queryFn: () => getUsers(1) })
  const { data: soutenancesData } = useQuery({ queryKey: ['soutenances', 1], queryFn: () => getSoutenances(1) })

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">Tableau de bord — Administration</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Utilisateurs" value={usersData?.meta?.total} to="/admin/users" color="primary" />
        <StatCard label="Soutenances" value={soutenancesData?.meta?.total} to="/secretaire/soutenances" color="green" />
        <StatCard label="Salles" value={null} to="/admin/salles" color="yellow" />
        <StatCard label="Journaux d'audit" value={null} to="/admin/audit" color="red" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/admin/users" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-gray-900">Gérer les utilisateurs</p>
          <p className="mt-1 text-sm text-gray-500">Créer, modifier, désactiver les comptes</p>
        </Link>
        <Link to="/admin/salles" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-gray-900">Gérer les salles</p>
          <p className="mt-1 text-sm text-gray-500">Capacité, localisation, disponibilité</p>
        </Link>
        <Link to="/admin/audit" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-gray-900">Journal d'audit</p>
          <p className="mt-1 text-sm text-gray-500">Traçabilité des actions du système</p>
        </Link>
      </div>
    </div>
  )
}
