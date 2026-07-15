'use client'

import { useEffect, useState, useCallback } from 'react'
import { Printer, TrendingUp, Layers, PieChart, Calendar } from 'lucide-react'
import DashboardLayout from '../../../../components/layout/DashboardLayout'
import { authorizedRequest } from '../../../../lib/api'
import { useFormat } from '@/hooks/useFormat'

interface Quarter { quarter: string; label: string; deployed: number; positions: number; cumulativeAum: number }
interface SectorRow { sector: string; value: number; allocation: number }
interface Holding { name: string; sector: string; type: string; value: number; date: string }
interface Report {
  year: number
  currency: string
  generatedAt: string
  summary: { totalInvested: number; totalPositions: number; deployedThisYear: number; endOfYearAum: number }
  quarters: Quarter[]
  sectorAllocation: SectorRow[]
  holdings: Holding[]
}

const SECTOR_COLORS = ['#0F5257', '#C68A2E', '#2C7A57', '#3B6EA5', '#8A5A8F', '#B0761A', '#4C8C7D', '#9A6B4B']

export default function PortfolioReportPage() {
  const { formatCurrency, formatDate, formatNumber } = useFormat()
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(async (y: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authorizedRequest(`/api/investors/portfolio/report?year=${y}`)
      if (res.ok) {
        setReport(await res.json())
      } else if (res.status === 404) {
        setError('No investor profile found for your account yet.')
      } else {
        setError('Could not load the report. Please try again.')
      }
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReport(year) }, [year, fetchReport])

  const maxDeployed = report ? Math.max(1, ...report.quarters.map(q => q.deployed)) : 1
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 print:block">
          <div>
            <h1 className="text-3xl font-bold text-white">Quarterly Portfolio Report</h1>
            <p className="text-gray-400 mt-1">Capital deployment, allocation and holdings for the selected year.</p>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="bg-transparent text-white text-sm focus:outline-none"
                aria-label="Report year"
              >
                {years.map(y => <option key={y} value={y} className="bg-gray-800">{y}</option>)}
              </select>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
          </div>
        </div>

        {loading && <div className="text-gray-300">Generating report…</div>}
        {error && !loading && (
          <div className="bg-amber-600/10 border border-amber-500/30 text-amber-300 rounded-xl px-5 py-4">{error}</div>
        )}

        {report && !loading && !error && (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Invested', value: formatCurrency(report.summary.totalInvested, 'USD'), icon: TrendingUp },
                { label: 'Positions', value: formatNumber(report.summary.totalPositions), icon: Layers },
                { label: `Deployed in ${report.year}`, value: formatCurrency(report.summary.deployedThisYear, 'USD'), icon: Calendar },
                { label: `End-of-${report.year} AUM`, value: formatCurrency(report.summary.endOfYearAum, 'USD'), icon: PieChart },
              ].map((kpi) => (
                <div key={kpi.label} className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    <kpi.icon className="w-4 h-4" /> {kpi.label}
                  </div>
                  <p className="text-2xl font-bold text-white mt-2 tracking-tight tabular-nums">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Quarterly deployment */}
            <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-5">Capital deployed by quarter</h2>
              <div className="grid grid-cols-4 gap-4 items-end" style={{ minHeight: '160px' }}>
                {report.quarters.map((q) => (
                  <div key={q.quarter} className="flex flex-col items-center justify-end gap-2 h-full">
                    <span className="text-xs text-gray-300 tabular-nums">{formatCurrency(q.deployed, 'USD')}</span>
                    <div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${Math.max(4, (q.deployed / maxDeployed) * 120)}px`,
                        background: 'linear-gradient(180deg,#14807f,#0F5257)'
                      }}
                      title={`${q.label}: ${formatCurrency(q.deployed, 'USD')} across ${q.positions} position(s)`}
                    ></div>
                    <span className="text-xs font-semibold text-gray-400">{q.quarter}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4 border-t border-gray-700 pt-3">
                {report.quarters.map((q) => (
                  <div key={q.quarter} className="text-center">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500">Cumulative AUM</p>
                    <p className="text-sm text-white tabular-nums">{formatCurrency(q.cumulativeAum, 'USD')}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sector allocation */}
              <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Sector allocation</h2>
                {report.sectorAllocation.length === 0 && <p className="text-gray-400 text-sm">No holdings yet.</p>}
                <div className="space-y-3">
                  {report.sectorAllocation.map((s, idx) => (
                    <div key={s.sector}>
                      <div className="flex justify-between text-sm text-gray-300 mb-1">
                        <span>{s.sector}</span>
                        <span className="tabular-nums">{formatCurrency(s.value, 'USD')} · {s.allocation}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.allocation}%`, background: SECTOR_COLORS[idx % SECTOR_COLORS.length] }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Holdings */}
              <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Holdings</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase tracking-wider text-left">
                        <th className="pb-2 font-semibold">Company</th>
                        <th className="pb-2 font-semibold">Sector</th>
                        <th className="pb-2 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-200">
                      {report.holdings.length === 0 && (
                        <tr><td colSpan={3} className="py-3 text-gray-400">No holdings to report.</td></tr>
                      )}
                      {report.holdings.map((h, i) => (
                        <tr key={`${h.name}-${i}`} className="border-t border-gray-700/60">
                          <td className="py-2 pr-2">{h.name}</td>
                          <td className="py-2 pr-2 text-gray-400">{h.sector}</td>
                          <td className="py-2 text-right tabular-nums">{formatCurrency(h.value, 'USD')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <p className="text-xs text-gray-500">
              Generated {formatDate(report.generatedAt)} · amounts in USD · valuations reflect capital invested (mark-to-market pending live valuations).
            </p>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
