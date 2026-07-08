import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getPvs, exportFile } from '../../api/responsable'

/* ── Icônes ── */
function IconTrend() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  )
}
function IconBook() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}
function IconMortier() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  )
}
function IconAlert() {
  return (
    <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}
function IconCircleArrow() {
  return (
    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  )
}
function IconCsv() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
    </svg>
  )
}
function IconPdf() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="9.5" y2="9"/>
      <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>
    </svg>
  )
}

/* ── Graphique horizontal ── */
function HBarChart({ data }) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">Aucune donnée disponible.</p>
  }

  const maxVal   = Math.max(...data.map((d) => d.value), 1)
  const step     = Math.ceil(maxVal / 4)
  const chartMax = step * 4
  const ticks    = [0, step, step * 2, step * 3, chartMax]

  return (
    <div>
      {data.map((d, i) => (
        <div key={d.label} className="mb-3.5 flex items-center gap-3">
          <span className="w-[110px] shrink-0 text-right text-xs text-gray-500">{d.label}</span>
          <div className="relative flex-1 h-5 rounded-sm overflow-hidden" style={{ backgroundColor: '#f1f5f9' }}>
            {/* Gridlines */}
            {ticks.slice(1, -1).map((t) => (
              <div
                key={t}
                className="absolute top-0 bottom-0 w-px"
                style={{ left: `${(t / chartMax) * 100}%`, backgroundColor: '#e2e8f0' }}
              />
            ))}
            {/* Bar */}
            <div
              className="absolute left-0 top-0 h-full rounded-sm transition-all duration-500"
              style={{
                width: `${Math.min((d.value / chartMax) * 100, 100)}%`,
                backgroundColor: i === 0 ? '#c9a227' : '#0d1b35',
              }}
            />
          </div>
        </div>
      ))}
      {/* X-axis */}
      <div className="mt-2 ml-[122px]">
        <div className="flex justify-between">
          {ticks.map((t) => (
            <span key={t} className="text-[11px] text-gray-400">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Année académique courante ── */
const now = new Date()
const yearStart = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
const anneeLabel = `${yearStart}-${yearStart + 1}`

export default function ResponsableDashboard() {
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(null)

  const { data: pvData } = useQuery({
    queryKey: ['pvs-responsable', 1],
    queryFn: () => getPvs(1),
  })

  const pvs = pvData?.data ?? []

  /* ── Calcul des stats depuis les PVs ── */
  const pvsAvecNote    = pvs.filter((p) => p.note != null)
  const pvsReussites   = pvsAvecNote.filter((p) => parseFloat(p.note) >= 10)
  const tauxReussite   = pvsAvecNote.length > 0
    ? Math.round((pvsReussites.length / pvsAvecNote.length) * 100)
    : null

  const licenceCount   = pvs.filter((p) => p.soutenance?.type === 'licence').length
  const masterCount    = pvs.filter((p) => p.soutenance?.type === 'master').length

  /* ── Données bar chart (filière) ── */
  const filiereCounts  = pvs.reduce((acc, pv) => {
    const f = pv.soutenance?.filiere ?? 'Autre'
    acc[f] = (acc[f] ?? 0) + 1
    return acc
  }, {})
  const chartData = Object.entries(filiereCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }))

  /* ── Alertes (soutenances des PVs sans salle / jury incomplet) ── */
  const sansSalle = pvs.filter((p) => !p.soutenance?.salle_id).length
  const juryIncomplet = pvs.filter((p) => (p.soutenance?.jury?.length ?? 0) < 3).length

  /* ── Export ── */
  const handleExport = async (format) => {
    setExporting(format)
    try {
      await exportFile(format)
    } catch {
      alert('Export non disponible pour le moment.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div>
      {/* En-tête */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold" style={{ color: '#0d1b35' }}>Tableau de bord pédagogique</h1>
        <p className="mt-0.5 text-sm text-gray-500">Suivi des soutenances — Année {anneeLabel}</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Taux de réussite */}
        <div
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          style={{ borderLeftWidth: 4, borderLeftColor: '#c9a227' }}
        >
          <div className="mb-3" style={{ color: '#c9a227' }}><IconTrend /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>
            {tauxReussite != null ? `${tauxReussite} %` : '—'}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-700">Taux de réussite</p>
          <p className="mt-0.5 text-xs text-gray-400">Année {anneeLabel}</p>
        </div>

        {/* Licence */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 text-gray-400"><IconBook /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>
            {licenceCount || '—'}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-700">Soutenances Licence</p>
          <p className="mt-0.5 text-xs text-gray-400">tous parcours confondus</p>
        </div>

        {/* Master */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-3 text-gray-400"><IconMortier /></div>
          <p className="text-3xl font-bold" style={{ color: '#0d1b35' }}>
            {masterCount || '—'}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-700">Soutenances Master</p>
          <p className="mt-0.5 text-xs text-gray-400">tous parcours confondus</p>
        </div>
      </div>

      {/* ── Graphique filières ── */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="font-semibold text-gray-900">Soutenances par filière</p>
        <p className="mt-0.5 text-xs text-gray-400">Répartition {anneeLabel}</p>
        <div className="mt-6">
          <HBarChart data={chartData} />
        </div>
      </div>

      {/* ── Alertes à traiter ── */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900">Alertes à traiter</p>
        </div>
        <div className="divide-y divide-gray-50">
          {sansSalle > 0 && (
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <IconAlert />
                <span>{sansSalle} soutenance{sansSalle > 1 ? 's' : ''} sans salle affectée</span>
              </div>
              <button
                onClick={() => navigate('/responsable/pv')}
                className="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <IconCircleArrow /> Traiter
              </button>
            </div>
          )}
          {juryIncomplet > 0 && (
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <IconAlert />
                <span>{juryIncomplet} soutenance{juryIncomplet > 1 ? 's' : ''} avec jury incomplet</span>
              </div>
              <button
                onClick={() => navigate('/responsable/pv')}
                className="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <IconCircleArrow /> Traiter
              </button>
            </div>
          )}
          {sansSalle === 0 && juryIncomplet === 0 && (
            <div className="px-6 py-6 text-center text-sm text-gray-400">
              Aucune alerte en attente.
            </div>
          )}
          {/* PVs en validation */}
          {(() => {
            const enValidation = pvs.filter((p) => p.status === 'en_validation').length
            if (enValidation > 0) {
              return (
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <IconAlert />
                    <span>{enValidation} PV{enValidation > 1 ? 's' : ''} en attente de validation</span>
                  </div>
                  <button
                    onClick={() => navigate('/responsable/pv')}
                    className="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                  >
                    <IconCircleArrow /> Traiter
                  </button>
                </div>
              )
            }
            return null
          })()}
        </div>
      </div>

      {/* ── Exports ── */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 font-semibold text-gray-900">Exports</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting === 'csv'}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            <IconCsv />
            {exporting === 'csv' ? 'Export…' : 'Exporter résultats CSV'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting === 'pdf'}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            <IconPdf />
            {exporting === 'pdf' ? 'Export…' : 'Exporter statistiques PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
