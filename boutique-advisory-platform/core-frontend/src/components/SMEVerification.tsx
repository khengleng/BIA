'use client'

import { useEffect, useState, useCallback } from 'react'
import { ShieldCheck, ShieldAlert, Check, Building2, Receipt, FileSpreadsheet } from 'lucide-react'
import { authorizedRequest } from '../lib/api'
import usePermissions from '../hooks/usePermissions'

interface VState {
  registryVerified: boolean
  taxVerified: boolean
  financialsVerified: boolean
  verificationNotes: string | null
}

const CHECKS: { key: keyof VState; label: string; hint: string; icon: typeof Building2 }[] = [
  { key: 'registryVerified', label: 'Business registry', hint: 'Ministry of Commerce registration', icon: Building2 },
  { key: 'taxVerified', label: 'Tax status', hint: 'GDT tax registration', icon: Receipt },
  { key: 'financialsVerified', label: 'Financials', hint: 'Bank statements / audited accounts', icon: FileSpreadsheet },
]

export default function SMEVerification({ smeId }: { smeId: string }) {
  const { user } = usePermissions()
  const canVerify = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'ADVISOR'
  const [state, setState] = useState<VState | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await authorizedRequest(`/api/smes/${smeId}`)
      if (res.ok) {
        const s = await res.json()
        const sme = s.sme || s
        setState({
          registryVerified: !!sme.registryVerified,
          taxVerified: !!sme.taxVerified,
          financialsVerified: !!sme.financialsVerified,
          verificationNotes: sme.verificationNotes ?? null,
        })
      }
    } catch { /* leave null */ }
  }, [smeId])

  useEffect(() => { load() }, [load])

  if (!state) return null
  const level = [state.registryVerified, state.taxVerified, state.financialsVerified].filter(Boolean).length

  const toggle = (key: keyof VState) => {
    if (!canVerify || saving) return
    setState(s => s ? { ...s, [key]: !s[key] } : s)
  }

  const save = async () => {
    if (!state) return
    setSaving(true); setMsg(null)
    try {
      const res = await authorizedRequest(`/api/smes/${smeId}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registryVerified: state.registryVerified,
          taxVerified: state.taxVerified,
          financialsVerified: state.financialsVerified,
          verificationNotes: state.verificationNotes || '',
        }),
      })
      setMsg(res.ok ? 'Verification saved.' : 'Could not save. Please try again.')
      if (res.ok) await load()
    } catch { setMsg('Could not reach the server.') } finally { setSaving(false); setTimeout(() => setMsg(null), 2500) }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          {level === 3 ? <ShieldCheck className="w-5 h-5 text-green-400" /> : <ShieldAlert className="w-5 h-5 text-amber-400" />}
          Verification
        </h2>
        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
          level === 3 ? 'text-green-400 bg-green-500/10 border-green-500/30'
            : level > 0 ? 'text-teal-400 bg-teal-500/10 border-teal-500/30'
              : 'text-gray-400 bg-gray-700/30 border-gray-700'}`}>
          {level}/3 verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CHECKS.map(c => {
          const on = state[c.key] as boolean
          return (
            <button
              key={c.key}
              onClick={() => toggle(c.key)}
              disabled={!canVerify}
              className={`text-left rounded-xl border p-3 transition-colors ${
                on ? 'border-green-500/40 bg-green-500/10' : 'border-gray-700 bg-gray-900/40'
              } ${canVerify ? 'hover:border-teal-500 cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-center justify-between">
                <c.icon className={`w-4 h-4 ${on ? 'text-green-400' : 'text-gray-500'}`} />
                {on && <Check className="w-4 h-4 text-green-400" />}
              </div>
              <p className="text-sm font-medium text-white mt-2">{c.label}</p>
              <p className="text-xs text-gray-500">{c.hint}</p>
            </button>
          )
        })}
      </div>

      {canVerify && (
        <div className="mt-4 space-y-3">
          <textarea
            value={state.verificationNotes || ''}
            onChange={e => setState(s => s ? { ...s, verificationNotes: e.target.value } : s)}
            placeholder="Verification notes (evidence reviewed, source, date)…"
            rows={2}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
          />
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving}
              className="bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2">
              {saving ? 'Saving…' : 'Save verification'}
            </button>
            {msg && <span className="text-sm text-gray-400">{msg}</span>}
          </div>
        </div>
      )}
      {!canVerify && (
        <p className="text-xs text-gray-500 mt-3">Verified by Cambobia advisors after reviewing registry, tax and financial evidence.</p>
      )}
    </div>
  )
}
