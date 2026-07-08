import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'

import Login from './pages/auth/Login'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminSalles from './pages/admin/Salles'
import AdminAudit from './pages/admin/Audit'

import SecretaireDashboard from './pages/secretaire/Dashboard'
import Soutenances from './pages/secretaire/Soutenances'
import SoutenanceDetail from './pages/secretaire/SoutenanceDetail'

import EnseignantDashboard from './pages/enseignant/Dashboard'
import MesJurys from './pages/enseignant/MesJurys'
import Indisponibilites from './pages/enseignant/Indisponibilites'

import ResponsableDashboard from './pages/responsable/Dashboard'
import ValidationPv from './pages/responsable/ValidationPv'

import EtudiantDashboard from './pages/etudiant/Dashboard'

import Notifications from './pages/shared/Notifications'

const DASHBOARDS = {
  administrateur: '/admin',
  secretaire_pedagogique: '/secretaire',
  enseignant: '/enseignant',
  responsable_pedagogique: '/responsable',
  etudiant: '/etudiant',
}

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={DASHBOARDS[user.role] ?? '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Publique */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/non-autorise" element={<div className="p-8 text-center text-red-600 font-semibold">Accès non autorisé.</div>} />

      {/* Protégées — Layout commun */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>

          {/* Notifications (tous rôles) */}
          <Route path="/notifications" element={<Notifications />} />

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['administrateur']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/salles" element={<AdminSalles />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
          </Route>

          {/* Secrétaire */}
          <Route element={<ProtectedRoute roles={['secretaire_pedagogique', 'administrateur']} />}>
            <Route path="/secretaire" element={<SecretaireDashboard />} />
            <Route path="/secretaire/soutenances" element={<Soutenances />} />
            <Route path="/secretaire/soutenances/:id" element={<SoutenanceDetail />} />
          </Route>

          {/* Enseignant */}
          <Route element={<ProtectedRoute roles={['enseignant']} />}>
            <Route path="/enseignant" element={<EnseignantDashboard />} />
            <Route path="/enseignant/jury" element={<MesJurys />} />
            <Route path="/enseignant/indisponibilites" element={<Indisponibilites />} />
          </Route>

          {/* Responsable */}
          <Route element={<ProtectedRoute roles={['responsable_pedagogique']} />}>
            <Route path="/responsable" element={<ResponsableDashboard />} />
            <Route path="/responsable/pv" element={<ValidationPv />} />
          </Route>

          {/* Étudiant */}
          <Route element={<ProtectedRoute roles={['etudiant']} />}>
            <Route path="/etudiant" element={<EtudiantDashboard />} />
            <Route path="/etudiant/soutenances" element={<EtudiantDashboard />} />
          </Route>

        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
