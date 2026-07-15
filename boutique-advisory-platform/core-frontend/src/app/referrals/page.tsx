'use client'

import { useEffect, useState } from 'react'
import { Gift, Copy, Check, Users, UserCheck, Clock } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { authorizedRequest } from '../../lib/api'
import { useFormat } from '@/hooks/useFormat'

interface Referral { refereeEmail: string; status: string; createdAt: string }
interface ReferralData {
  code: string
  inviteLink: string
  stats: { signedUp: number; converted: number; pending: number }
  referrals: Referral[]
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!domain) return email
  const shown = name.slice(0, 2)
  return `${shown}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`
}

export default function ReferralsPage() {
  const { formatDate } = useFormat()
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await authorizedRequest('/api/referrals/me')
        if (res.ok) setData(await res.json())
        else setError('Could not load your referrals. Please try again.')
      } catch {
        setError('Could not reach the server. Please try again.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const copy = async (text: string, which: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied(null), 1800)
    } catch { /* clipboard unavailable */ }
  }

  const statusStyle: Record<string, string> = {
    CONVERTED: 'text-green-400 bg-green-500/10 border-green-500/30',
    SIGNED_UP: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-300"><Gift className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-bold text-white">Invite &amp; earn</h1>
            <p className="text-gray-400 mt-1">Share your code with SMEs, investors and advisors. Track everyone you bring to the platform.</p>
          </div>
        </div>

        {loading && <div className="text-gray-300">Loading…</div>}
        {error && !loading && <div className="bg-amber-600/10 border border-amber-500/30 text-amber-300 rounded-xl px-5 py-4">{error}</div>}

        {data && !loading && (
          <>
            {/* Code + link */}
            <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Your referral code</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white tracking-widest font-mono">{data.code}</span>
                  <button onClick={() => copy(data.code, 'code')} className="inline-flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300">
                    {copied === 'code' ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Invite link</p>
                <div className="flex items-center gap-2">
                  <input readOnly value={data.inviteLink}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm font-mono truncate" />
                  <button onClick={() => copy(data.inviteLink, 'link')}
                    className="inline-flex items-center gap-1 bg-teal-700 hover:bg-teal-600 text-white text-sm font-medium rounded-lg px-4 py-2 whitespace-nowrap">
                    {copied === 'link' ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy link</>}
                  </button>
                </div>
              </div>
            </section>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Signed up', value: data.stats.signedUp, icon: Users, color: 'text-teal-400' },
                { label: 'Converted', value: data.stats.converted, icon: UserCheck, color: 'text-green-400' },
                { label: 'Pending', value: data.stats.pending, icon: Clock, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                  <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${s.color}`}>
                    <s.icon className="w-4 h-4" /> {s.label}
                  </div>
                  <p className="text-3xl font-bold text-white mt-2 tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>

            {/* List */}
            <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">People you&apos;ve referred</h2>
              {data.referrals.length === 0 ? (
                <p className="text-gray-400 text-sm">No referrals yet. Share your link to get started.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase tracking-wider text-left">
                        <th className="pb-2 font-semibold">Invitee</th>
                        <th className="pb-2 font-semibold">Joined</th>
                        <th className="pb-2 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-200">
                      {data.referrals.map((r, i) => (
                        <tr key={i} className="border-t border-gray-700/60">
                          <td className="py-2 pr-2 font-mono text-gray-300">{maskEmail(r.refereeEmail)}</td>
                          <td className="py-2 pr-2 text-gray-400">{formatDate(r.createdAt)}</td>
                          <td className="py-2 text-right">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${statusStyle[r.status] || statusStyle.SIGNED_UP}`}>
                              {r.status === 'CONVERTED' ? 'Converted' : 'Signed up'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
