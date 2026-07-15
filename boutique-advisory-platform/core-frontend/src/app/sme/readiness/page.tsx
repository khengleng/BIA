'use client'

import { useState } from 'react'
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import DashboardLayout from '../../../components/layout/DashboardLayout'
import { authorizedRequest } from '../../../lib/api'
import { useFormat } from '@/hooks/useFormat'

interface Dimension { name: string; score: number; comment: string }
interface ActionItem { priority: string; title: string; detail: string }
interface Analysis {
  overallScore: number
  readinessLevel: string
  summary: string
  dimensions: Dimension[]
  strengths: string[]
  gaps: string[]
  actionItems: ActionItem[]
}
interface Result { configured: boolean; message?: string; smeName?: string; analysis?: Analysis }

const LEVEL_COLOR: Record<string, string> = {
  'Investment-Ready': 'text-green-400 bg-green-500/10 border-green-500/30',
  'Approaching': 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  'Developing': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'Early': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
}
const PRIORITY_COLOR: Record<string, string> = {
  High: 'text-red-300 bg-red-500/10 border-red-500/30',
  Medium: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  Low: 'text-gray-300 bg-gray-600/20 border-gray-600/40',
}

function scoreColor(score: number): string {
  if (score >= 75) return '#2C7A57'
  if (score >= 50) return '#C68A2E'
  return '#C1543C'
}

export default function ReadinessCoachPage() {
  const { lang } = useFormat()
  const [answers, setAnswers] = useState({
    monthlyRevenueUsd: '',
    hasAuditedFinancials: '',
    runwayMonths: '',
    fullTimeTeam: '',
    biggestChallenge: '',
  })
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (k: keyof typeof answers, v: string) => setAnswers(a => ({ ...a, [k]: v }))

  const run = async () => {
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await authorizedRequest('/api/ai/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, answers }),
      })
      if (res.ok) {
        setResult(await res.json())
      } else if (res.status === 404) {
        setError('Complete your SME profile first, then run the assessment.')
      } else {
        setError('The coach could not complete the assessment. Please try again.')
      }
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const analysis = result?.analysis

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-500/15 text-teal-300"><Sparkles className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Investment-Readiness Coach</h1>
            <p className="text-gray-400 mt-1">Get an instant, private read on how ready your business is to raise — with specific next steps. Powered by Claude.</p>
          </div>
        </div>

        {/* Questionnaire */}
        <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">A few optional details sharpen the assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm text-gray-300">
              Average monthly revenue (USD)
              <input type="number" min="0" value={answers.monthlyRevenueUsd} onChange={e => update('monthlyRevenueUsd', e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" placeholder="e.g. 8000" />
            </label>
            <label className="text-sm text-gray-300">
              Audited / reviewed financials?
              <select value={answers.hasAuditedFinancials} onChange={e => update('hasAuditedFinancials', e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500">
                <option value="">Select…</option>
                <option value="yes">Yes</option>
                <option value="in-progress">In progress</option>
                <option value="no">No</option>
              </select>
            </label>
            <label className="text-sm text-gray-300">
              Cash runway (months)
              <input type="number" min="0" value={answers.runwayMonths} onChange={e => update('runwayMonths', e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" placeholder="e.g. 6" />
            </label>
            <label className="text-sm text-gray-300">
              Full-time team size
              <input type="number" min="0" value={answers.fullTimeTeam} onChange={e => update('fullTimeTeam', e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" placeholder="e.g. 12" />
            </label>
            <label className="text-sm text-gray-300 md:col-span-2">
              Your biggest obstacle to raising (optional)
              <input type="text" value={answers.biggestChallenge} onChange={e => update('biggestChallenge', e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500" placeholder="e.g. we don't have formal financial statements" />
            </label>
          </div>
          <button onClick={run} disabled={loading}
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2.5 transition-colors">
            <Sparkles className="w-4 h-4" /> {loading ? 'Assessing…' : 'Generate my readiness assessment'}
          </button>
          {error && <p className="text-amber-300 text-sm">{error}</p>}
          {result && !result.configured && <p className="text-amber-300 text-sm">{result.message}</p>}
        </section>

        {/* Results */}
        {analysis && (
          <section className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-28 h-28 flex-none">
                <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#374151" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke={scoreColor(analysis.overallScore)} strokeWidth="3"
                    strokeDasharray={`${(analysis.overallScore / 100) * 97.4} 97.4`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white tabular-nums">{analysis.overallScore}</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">/ 100</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${LEVEL_COLOR[analysis.readinessLevel] || LEVEL_COLOR['Developing']}`}>
                  {analysis.readinessLevel}
                </span>
                <p className="text-gray-200 mt-3">{analysis.summary}</p>
              </div>
            </div>

            {analysis.dimensions?.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Readiness by dimension</h2>
                <div className="space-y-4">
                  {analysis.dimensions.map((d) => (
                    <div key={d.name}>
                      <div className="flex justify-between text-sm text-gray-300 mb-1">
                        <span className="font-medium">{d.name}</span>
                        <span className="tabular-nums">{d.score}/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, d.score))}%`, background: scoreColor(d.score) }}></div>
                      </div>
                      {d.comment && <p className="text-xs text-gray-500 mt-1">{d.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-green-400 mb-3"><CheckCircle2 className="w-4 h-4" /> Strengths</h3>
                <ul className="space-y-2">
                  {(analysis.strengths || []).map((s, i) => <li key={i} className="text-gray-200 text-sm flex gap-2"><TrendingUp className="w-4 h-4 text-green-500 flex-none mt-0.5" />{s}</li>)}
                  {(!analysis.strengths || analysis.strengths.length === 0) && <li className="text-gray-500 text-sm">None identified yet.</li>}
                </ul>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400 mb-3"><AlertTriangle className="w-4 h-4" /> Gaps to close</h3>
                <ul className="space-y-2">
                  {(analysis.gaps || []).map((g, i) => <li key={i} className="text-gray-200 text-sm flex gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 flex-none mt-0.5" />{g}</li>)}
                  {(!analysis.gaps || analysis.gaps.length === 0) && <li className="text-gray-500 text-sm">None identified.</li>}
                </ul>
              </div>
            </div>

            {analysis.actionItems?.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Your prioritized action plan</h2>
                <ul className="space-y-3">
                  {analysis.actionItems.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 border-t border-gray-700/60 pt-3 first:border-0 first:pt-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border flex-none ${PRIORITY_COLOR[a.priority] || PRIORITY_COLOR.Low}`}>{a.priority}</span>
                      <div>
                        <p className="text-white text-sm font-medium flex items-center gap-1">{a.title}</p>
                        <p className="text-gray-400 text-sm">{a.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <a href="/advisory" className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 text-sm font-medium mt-5">
                  Get advisor help closing these gaps <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            <p className="text-xs text-gray-500">Generated by AI as guidance, not a certification. {result?.smeName ? `Assessment for ${result.smeName}.` : ''}</p>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
