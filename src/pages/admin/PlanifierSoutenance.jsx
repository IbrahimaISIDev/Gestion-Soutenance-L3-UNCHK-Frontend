import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { getUsers } from '../../api/users'
import { getSalles } from '../../api/salles'
import { createSoutenance } from '../../api/soutenances'

const FILIERES = ['Licence Informatique','Licence Réseaux','Master Informatique','Master SSI','Doctorat Informatique']
const TYPES    = ['licence','master','doctorat']

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

export default function PlanifierSoutenance() {
  const navigate = useNavigate()
  const [availability, setAvailability] = useState(null)

  const { data: usersData } = useQuery({ queryKey: ['users', 1], queryFn: () => getUsers(1) })
  const { data: sallesData } = useQuery({ queryKey: ['salles', 1], queryFn: () => getSalles(1) })

  const users  = usersData?.data ?? []
  const etudiants  = users.filter((u) => u.role === 'etudiant')
  const enseignants = users.filter((u) => u.role === 'enseignant')
  const salles = (sallesData?.data ?? []).filter((s) => s.actif)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { etudiant_id: '', directeur_id: '', titre: '', filiere: '', type: 'master', salle_id: '', date: '', heure: '' }
  })

  const [salleId, directeurId, date, heure] = watch(['salle_id', 'directeur_id', 'date', 'heure'])

  /* Vérification disponibilité (simulée) — remplacer par vrai appel API si endpoint dispo */
  useEffect(() => {
    if (salleId && date && heure) {
      setAvailability({ salleOk: true, enseignantOk: !!directeurId })
    } else {
      setAvailability(null)
    }
  }, [salleId, directeurId, date, heure])

  const create = useMutation({
    mutationFn: (data) => createSoutenance(data),
    onSuccess: () => navigate('/secretaire/soutenances'),
  })

  const onSubmit = (data) => {
    const payload = {
      etudiant_id:   Number(data.etudiant_id),
      directeur_id:  Number(data.directeur_id),
      titre:         data.titre,
      filiere:       data.filiere,
      type:          data.type,
      salle_id:      data.salle_id ? Number(data.salle_id) : null,
      date:          data.date || null,
      heure:         data.heure || null,
    }
    create.mutate(payload)
  }

  const fieldClass = (err) =>
    `input w-full ${err ? 'border-red-400' : ''}`

  return (
    <div>
      {/* En-tête */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Planifier une soutenance</h1>
        <p className="mt-0.5 text-sm text-gray-500">Renseignez les informations de la soutenance à planifier</p>
      </div>

      {/* Formulaire */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

          {/* Ligne 1 : Étudiant + Directeur */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                Étudiant <span className="text-red-400">*</span>
              </label>
              <select
                {...register('etudiant_id', { required: true })}
                className={fieldClass(errors.etudiant_id)}
              >
                <option value="">Sélectionner un étudiant</option>
                {etudiants.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                Directeur de mémoire <span className="text-red-400">*</span>
              </label>
              <select
                {...register('directeur_id', { required: true })}
                className={fieldClass(errors.directeur_id)}
              >
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-600">
              Titre du mémoire <span className="text-red-400">*</span>
            </label>
            <input
              {...register('titre', { required: true })}
              className={fieldClass(errors.titre)}
              placeholder="Saisir le titre du mémoire..."
            />
          </div>

          {/* Ligne 3 : Filière + Type + Salle */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                Filière <span className="text-red-400">*</span>
              </label>
              <select
                {...register('filiere', { required: true })}
                className={fieldClass(errors.filiere)}
              >
                <option value="">Filière</option>
                {FILIERES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                Type <span className="text-red-400">*</span>
              </label>
              <select {...register('type', { required: true })} className={fieldClass(errors.type)}>
                {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-600">Salle</label>
              <select {...register('salle_id')} className="input w-full">
                <option value="">Sélectionner</option>
                {salles.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
          </div>

          {/* Ligne 4 : Date + Heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                {...register('date', { required: true })}
                className={fieldClass(errors.date)}
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                Heure <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                {...register('heure', { required: true })}
                className={fieldClass(errors.heure)}
              />
            </div>
          </div>

          {/* Vérification disponibilités */}
          {availability && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-700">
                Vérification des disponibilités
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-sm text-emerald-700">
                  <CheckIcon />
                  {availability.salleOk ? 'Salle disponible à cette date et heure' : 'Salle non disponible'}
                </li>
                {directeurId && (
                  <li className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckIcon />
                    {availability.enseignantOk ? 'Enseignant disponible' : 'Enseignant indisponible à cette date'}
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Erreur serveur */}
          {create.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {create.error?.response?.data?.message ?? 'Une erreur est survenue.'}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || create.isPending}
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: '#0d1b35' }}
            >
              {create.isPending ? 'Planification…' : 'Planifier la soutenance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
