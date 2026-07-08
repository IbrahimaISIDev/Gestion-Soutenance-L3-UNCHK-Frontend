import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'

const DEMO_ACCOUNTS = [
  { email: 'admin@univ.sn',       password: 'password', role: 'ADMIN',       badge: 'bg-amber-100 text-amber-800'   },
  { email: 'secretaire@univ.sn',  password: 'password', role: 'SECRÉTAIRE',  badge: 'bg-sky-100 text-sky-800'       },
  { email: 'etudiant@univ.sn',    password: 'password', role: 'ÉTUDIANT',    badge: 'bg-emerald-100 text-emerald-700' },
  { email: 'responsable@univ.sn', password: 'password', role: 'RESPONSABLE', badge: 'bg-orange-100 text-orange-700' },
]

const DASHBOARDS = {
  administrateur:        '/admin',
  secretaire_pedagogique:'/secretaire',
  enseignant:            '/enseignant',
  responsable_pedagogique:'/responsable',
  etudiant:              '/etudiant',
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [showPassword, setShowPassword]   = useState(false)
  const [selectedDemo, setSelectedDemo]   = useState(null)
  const [serverError, setServerError]     = useState('')
  const [showForgotMsg, setShowForgotMsg] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '', remember: true },
  })

  const handleDemoClick = (account) => {
    setSelectedDemo(account.email)
    setValue('email',    account.email,    { shouldValidate: true })
    setValue('password', account.password, { shouldValidate: true })
    setServerError('')
    setShowForgotMsg(false)
  }

  const onSubmit = async (data) => {
    try {
      setServerError('')
      const user = await login({ email: data.email, password: data.password }, data.remember)
      navigate(DASHBOARDS[user.role] ?? '/', { replace: true })
    } catch (err) {
      setServerError(
        err.response?.data?.message ??
        'Identifiants incorrects. Vérifiez votre email et mot de passe.'
      )
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ─── Panneau gauche – Navy ─── */}
      <div
        className="hidden lg:flex lg:w-[42%] flex-col justify-between p-10 xl:p-14"
        style={{ backgroundColor: '#0d1b35' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: '#c9a227' }}>
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white">GestSoutenance</p>
            <p className="text-xs" style={{ color: '#8898aa' }}>UNCHK</p>
          </div>
        </div>

        {/* Accroche centrale */}
        <div>
          <h1 className="text-4xl font-bold leading-snug text-white xl:text-5xl">
            Système de Gestion des{' '}
            <span style={{ color: '#c9a227' }}>Soutenances</span>{' '}
            Universitaires
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed" style={{ color: '#8898aa' }}>
            Plateforme institutionnelle de gestion des soutenances académiques.
            Accédez à votre espace dédié selon votre rôle.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs" style={{ color: '#8898aa' }}>
          🔒 Connexion sécurisée — © 2026 UNCHK
        </p>
      </div>

      {/* ─── Panneau droit – Formulaire ─── */}
      <div
        className="flex flex-1 items-center justify-center px-8 py-12"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className="w-full max-w-[420px]">

          <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
          <p className="mt-1.5 text-sm text-gray-500">
            Entrez vos identifiants institutionnels pour accéder à votre espace.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                Adresse email
              </label>
              <input
                type="email"
                placeholder="admin@univ.sn"
                autoComplete="email"
                {...register('email', { required: "L'adresse email est requise." })}
                className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                  errors.email
                    ? 'border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:border-gray-400 focus:ring-gray-100'
                }`}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', { required: 'Le mot de passe est requis.' })}
                  className={`w-full rounded-lg border bg-white px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition focus:ring-2 ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-100'
                      : 'border-gray-300 focus:border-gray-400 focus:ring-gray-100'
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Se souvenir + Mot de passe oublié */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  {...register('remember')}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Se souvenir de moi
              </label>
              <button
                type="button"
                onClick={() => setShowForgotMsg((s) => !s)}
                className="text-sm font-medium transition-opacity hover:opacity-75"
                style={{ color: '#c9a227' }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Message mot de passe oublié */}
            {showForgotMsg && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Contactez votre administrateur système pour réinitialiser votre mot de passe.
              </div>
            )}

            {/* Erreur serveur */}
            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </div>
            )}

            {/* Bouton soumettre */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 w-full rounded-lg py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#0d1b35' }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Connexion en cours…
                </span>
              ) : (
                'SE CONNECTER'
              )}
            </button>
          </form>

          {/* ─── Comptes de démonstration ─── */}
          <div className="mt-8">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Comptes de démonstration
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => {
                const active = selectedDemo === account.email
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoClick(account)}
                    className="w-full flex items-center justify-between rounded-lg border px-4 py-2.5 text-left transition-all hover:bg-amber-50"
                    style={{
                      backgroundColor: active ? '#fdf8e7' : '#ffffff',
                      borderColor:     active ? '#c9a227' : '#e5e7eb',
                    }}
                  >
                    <span className="font-mono text-xs text-gray-600">{account.email}</span>
                    <span className={`rounded px-2 py-0.5 text-[11px] font-bold tracking-wide ${account.badge}`}>
                      {account.role}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
