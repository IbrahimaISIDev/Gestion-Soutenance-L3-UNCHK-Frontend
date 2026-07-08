import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMesJurys } from '../../api/jury'

export default function EnseignantDashboard() {
  const { data } = useQuery({ queryKey: ['mes-jurys'], queryFn: getMesJurys })
  const enAttente = (data?.data ?? []).filter((j) => j.statut_confirmation === 'en_attente').length

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">Tableau de bord — Enseignant</h1>

      {enAttente > 0 && (
        <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          Vous avez <strong>{enAttente}</strong> invitation(s) au jury en attente de réponse.{' '}
          <Link to="/enseignant/jury" className="font-medium underline">Répondre</Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/enseignant/jury" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-gray-900">Mes participations au jury</p>
          <p className="mt-1 text-sm text-gray-500">Consulter et répondre aux invitations</p>
        </Link>
        <Link to="/enseignant/indisponibilites" className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-gray-900">Mes indisponibilités</p>
          <p className="mt-1 text-sm text-gray-500">Déclarer et gérer vos créneaux indisponibles</p>
        </Link>
      </div>
    </div>
  )
}
