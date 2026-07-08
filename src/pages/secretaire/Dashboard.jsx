import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getSoutenances } from '../../api/soutenances'

export default function SecretaireDashboard() {
  const { data } = useQuery({ queryKey: ['soutenances', 1], queryFn: () => getSoutenances(1) })
  const total = data?.meta?.total ?? '…'

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">Tableau de bord — Secrétariat pédagogique</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-700">
          <p className="text-sm font-medium opacity-80">Soutenances totales</p>
          <p className="mt-1 text-3xl font-bold">{total}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/secretaire/soutenances" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-gray-900">Gérer les soutenances</p>
          <p className="mt-1 text-sm text-gray-500">Créer, planifier, confirmer ou annuler des soutenances</p>
        </Link>
        <Link to="/notifications" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-gray-900">Notifications</p>
          <p className="mt-1 text-sm text-gray-500">Consulter les alertes et messages du système</p>
        </Link>
      </div>
    </div>
  )
}
