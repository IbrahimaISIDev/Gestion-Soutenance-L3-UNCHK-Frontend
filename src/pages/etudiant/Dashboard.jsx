import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMesSoutenances } from '../../api/soutenances'
import { downloadDocument } from '../../api/documents'

/* ── Statut badges (pills arrondis) ── */
const STATUT_BADGE = {
  brouillon: 'bg-gray-100 text-gray-500',
  planifiee: 'border border-amber-300 bg-amber-50 text-amber-600',
  confirmee: 'border border-sky-300 bg-sky-50 text-sky-600',
  realisee:  'border border-emerald-300 bg-emerald-50 text-emerald-600',
  annulee:   'border border-red-200 bg-red-50 text-red-500',
}
const STATUT_LABELS = {
  brouillon: 'Brouillon',
  planifiee: 'Planifiée',
  confirmee: 'Confirmée',
  realisee:  'Réalisée',
  annulee:   'Annulée',
}
const DOC_TYPES = {
  convocation: 'Convocation',
  pv:          'Procès-verbal',
  attestation: 'Attestation',
}

/* ── Icônes ── */
function IconCalendar() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IconBuilding() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 0 1 6 0v4"/>
    </svg>
  )
}
function IconMortier() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  )
}
function IconUsers() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function IconDownload() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
function IconFile() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}
function IconClipboard() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
    </svg>
  )
}

/* ── Helpers ── */
function formatDateFR(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatDateShort(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function getFilename(path) {
  if (!path) return 'document.pdf'
  return path.split('/').pop() || path
}

function DocIcon({ type }) {
  return type === 'attestation' ? <IconClipboard /> : <IconFile />
}

export default function EtudiantDashboard() {
  const [downloading, setDownloading] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['mes-soutenances'],
    queryFn: getMesSoutenances,
  })

  const soutenances = Array.isArray(data) ? data : (data?.data ?? [])

  /* ── Prochaine soutenance ── */
  const prochaine = soutenances.find((s) =>
    ['planifiee', 'confirmee'].includes(s.statut) && s.date
  )

  const convDoc = prochaine?.documents?.find((d) => d.type === 'convocation')

  const juryNames = (prochaine?.jury ?? [])
    .slice(0, 2)
    .map((j) => j.utilisateur?.name)
    .filter(Boolean)
    .join(', ')
  const juryMore = (prochaine?.jury?.length ?? 0) > 2

  /* ── Tous les documents (toutes soutenances) ── */
  const allDocs = soutenances.flatMap((s) =>
    (s.documents ?? []).map((d) => ({ ...d, _soutenance: s }))
  )

  /* ── Téléchargement ── */
  const handleDownload = async (doc) => {
    if (downloading === doc.id) return
    setDownloading(doc.id)
    try {
      await downloadDocument(doc.id, getFilename(doc.chemin_fichier))
    } catch {
      alert('Téléchargement indisponible pour le moment.')
    } finally {
      setDownloading(null)
    }
  }

  if (isLoading) {
    return <p className="py-10 text-center text-sm text-gray-400">Chargement...</p>
  }

  return (
    <div className="space-y-5">

      {/* ── Hero : Prochaine soutenance ── */}
      {prochaine ? (
        <div className="rounded-2xl p-8" style={{ backgroundColor: '#0d1b35' }}>
          <p
            className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em]"
            style={{ color: '#c9a227' }}
          >
            Prochaine soutenance
          </p>

          <h1 className="mb-6 text-[22px] font-bold leading-snug text-white" style={{ maxWidth: '85%' }}>
            {prochaine.titre}
          </h1>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <div className="flex items-center gap-2">
              <IconCalendar />
              <span>
                {formatDateFR(prochaine.date)} à{' '}
                <strong className="text-white">{prochaine.heure ?? '—'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IconBuilding />
              <span>
                Salle :{' '}
                <strong className="text-white">{prochaine.salle?.nom ?? 'Non assignée'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IconMortier />
              <span>
                Directeur :{' '}
                <strong className="text-white">{prochaine.directeur?.name ?? '—'}</strong>
              </span>
            </div>
            {(juryNames || juryMore) && (
              <div className="flex items-center gap-2">
                <IconUsers />
                <span>
                  Jury :{' '}
                  <strong className="text-white">
                    {juryNames}{juryMore ? '…' : ''}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {convDoc ? (
            <button
              onClick={() => handleDownload(convDoc)}
              disabled={downloading === convDoc.id}
              className="mt-7 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition hover:brightness-90 disabled:opacity-70"
              style={{ backgroundColor: '#c9a227', color: '#0d1b35' }}
            >
              <IconDownload />
              {downloading === convDoc.id ? 'Téléchargement…' : 'Télécharger la convocation'}
            </button>
          ) : (
            <p className="mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              La convocation sera disponible prochainement.
            </p>
          )}
        </div>
      ) : (
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: '#0d1b35' }}
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Aucune soutenance à venir pour le moment.
          </p>
        </div>
      )}

      {/* ── Mes soutenances ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="font-semibold text-gray-900">Mes soutenances</p>
        </div>

        {soutenances.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-400">Aucune soutenance enregistrée.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Date', 'Titre', 'Statut', 'Résultat', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {soutenances.map((s) => {
                const docs = s.documents ?? []
                return (
                  <tr key={s.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4 text-xs text-gray-500 tabular-nums">
                      {formatDateShort(s.date)}
                    </td>
                    <td className="max-w-[200px] truncate px-5 py-4 font-medium" style={{ color: '#0d1b35' }}>
                      {s.titre}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUT_BADGE[s.statut] ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUT_LABELS[s.statut] ?? s.statut}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {s.pv?.note != null ? (
                        <span className="font-semibold" style={{ color: '#059669' }}>
                          {s.pv.note} / 20{s.pv.mention ? ` — ${s.pv.mention}` : ''}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        {docs.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => handleDownload(d)}
                            disabled={downloading === d.id}
                            title={DOC_TYPES[d.type] ?? d.type}
                            className="transition hover:text-indigo-600 disabled:opacity-40"
                          >
                            <DocIcon type={d.type} />
                          </button>
                        ))}
                        {docs.length === 0 && <span className="text-gray-300">—</span>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Mes documents ── */}
      {allDocs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <p className="font-semibold text-gray-900">Mes documents</p>
          </div>
          <ul className="divide-y divide-gray-50">
            {allDocs.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 text-gray-400">
                    <DocIcon type={doc.type} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {getFilename(doc.chemin_fichier)}
                    </p>
                    <p className="text-xs text-gray-400">{DOC_TYPES[doc.type] ?? doc.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  disabled={downloading === doc.id}
                  className="ml-4 flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <IconDownload />
                  {downloading === doc.id ? 'Téléchargement…' : 'Télécharger'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {allDocs.length === 0 && soutenances.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-sm">
          <p className="text-center text-sm font-semibold text-gray-700">Mes documents</p>
          <p className="mt-1 text-center text-xs text-gray-400">Aucun document disponible pour le moment.</p>
        </div>
      )}
    </div>
  )
}
