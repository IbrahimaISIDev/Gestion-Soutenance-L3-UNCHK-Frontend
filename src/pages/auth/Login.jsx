import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const DASHBOARD_BY_ROLE = {
  administrateur: '/admin',
  secretaire_pedagogique: '/secretaire',
  enseignant: '/enseignant',
  etudiant: '/etudiant',
  responsable_pedagogique: '/responsable',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    setServerError('')
    try {
      const user = await login(data)
      navigate(DASHBOARD_BY_ROLE[user.role] ?? '/', { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Identifiants incorrects.'
      setServerError(msg)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo / Titre */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">GestSoutenance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connectez-vous à votre espace
          </p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Adresse e-mail
            </label>
            <input
              type="email"
              autoComplete="email"
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.email ? 'border-red-400' : 'border-gray-300'
              }`}
              {...register('email', {
                required: "L'adresse e-mail est requise.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Format d'e-mail invalide.",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.password ? 'border-red-400' : 'border-gray-300'
              }`}
              {...register('password', {
                required: 'Le mot de passe est requis.',
                minLength: { value: 8, message: 'Minimum 8 caractères.' },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
