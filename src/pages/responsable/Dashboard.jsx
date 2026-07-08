import { Link } from 'react-router-dom'

export default function ResponsableDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">Tableau de bord — Responsable pédagogique</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/responsable/pv" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-gray-900">Validation des PV</p>
          <p className="mt-1 text-sm text-gray-500">Valider ou rejeter les procès-verbaux soumis</p>
        </Link>
        <Link to="/notifications" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-gray-900">Notifications</p>
          <p className="mt-1 text-sm text-gray-500">Alertes et messages du système</p>
        </Link>
      </div>
    </div>
  )
}
