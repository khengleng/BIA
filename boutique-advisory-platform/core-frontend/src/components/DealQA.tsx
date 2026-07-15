'use client'

import { useCallback, useEffect, useState } from 'react'
import { MessageCircleQuestion, Send, CheckCircle2 } from 'lucide-react'
import { authorizedRequest } from '../lib/api'
import { useFormat } from '@/hooks/useFormat'

interface Question {
  id: string
  askedByName: string
  askedByRole: string
  question: string
  answer: string | null
  answeredByName: string | null
  status: string
  createdAt: string
  answeredAt: string | null
}

export default function DealQA({ dealId, canAnswer = false }: { dealId: string; canAnswer?: boolean }) {
  const { formatDate } = useFormat()
  const [questions, setQuestions] = useState<Question[]>([])
  const [counts, setCounts] = useState({ total: 0, open: 0, answered: 0 })
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await authorizedRequest(`/api/deal-qa/${dealId}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questions || [])
        setCounts({ total: data.total || 0, open: data.open || 0, answered: data.answered || 0 })
      }
    } catch { /* keep prior state */ } finally { setLoading(false) }
  }, [dealId])

  useEffect(() => { load() }, [load])

  const ask = async () => {
    const q = newQuestion.trim()
    if (!q) return
    setSubmitting(true); setError(null)
    try {
      const res = await authorizedRequest(`/api/deal-qa/${dealId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q })
      })
      if (res.ok) { setNewQuestion(''); await load() }
      else { const d = await res.json().catch(() => ({})); setError(d.error || 'Could not submit your question.') }
    } catch { setError('Could not reach the server.') } finally { setSubmitting(false) }
  }

  const answer = async (questionId: string) => {
    const a = (answerDrafts[questionId] || '').trim()
    if (!a) return
    setSubmitting(true); setError(null)
    try {
      const res = await authorizedRequest(`/api/deal-qa/${dealId}/${questionId}/answer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answer: a })
      })
      if (res.ok) { setAnswerDrafts(d => ({ ...d, [questionId]: '' })); await load() }
      else { const d = await res.json().catch(() => ({})); setError(d.error || 'Could not submit the answer.') }
    } catch { setError('Could not reach the server.') } finally { setSubmitting(false) }
  }

  return (
    <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <MessageCircleQuestion className="w-5 h-5 text-teal-400" /> Deal Q&amp;A
        </h2>
        <span className="text-xs text-gray-400">{counts.answered} answered · {counts.open} open</span>
      </div>

      {/* Ask */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <input
          value={newQuestion}
          onChange={e => setNewQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !submitting) ask() }}
          placeholder="Ask a question about this deal…"
          maxLength={2000}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
        />
        <button onClick={ask} disabled={submitting || !newQuestion.trim()}
          className="inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2">
          <Send className="w-4 h-4" /> Ask
        </button>
      </div>
      {error && <p className="text-amber-300 text-sm mb-3">{error}</p>}

      {/* Thread */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading questions…</p>
      ) : questions.length === 0 ? (
        <p className="text-gray-400 text-sm">No questions yet. Be the first to ask.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map(q => (
            <li key={q.id} className="border-t border-gray-700/60 pt-4 first:border-0 first:pt-0">
              <div className="flex items-start justify-between gap-3">
                <p className="text-gray-100 text-sm font-medium">{q.question}</p>
                {q.status === 'ANSWERED'
                  ? <span className="flex-none inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-400"><CheckCircle2 className="w-3 h-3" /> Answered</span>
                  : <span className="flex-none text-[10px] font-bold uppercase tracking-wider text-amber-400">Open</span>}
              </div>
              <p className="text-xs text-gray-500 mt-1">{q.askedByName} · {q.askedByRole} · {formatDate(q.createdAt)}</p>

              {q.answer && (
                <div className="mt-2 ml-3 pl-3 border-l-2 border-teal-500/40">
                  <p className="text-gray-200 text-sm">{q.answer}</p>
                  <p className="text-xs text-gray-500 mt-1">{q.answeredByName} · {q.answeredAt ? formatDate(q.answeredAt) : ''}</p>
                </div>
              )}

              {canAnswer && q.status !== 'ANSWERED' && (
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <input
                    value={answerDrafts[q.id] || ''}
                    onChange={e => setAnswerDrafts(d => ({ ...d, [q.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter' && !submitting) answer(q.id) }}
                    placeholder="Write an answer…"
                    maxLength={4000}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-teal-500"
                  />
                  <button onClick={() => answer(q.id)} disabled={submitting || !(answerDrafts[q.id] || '').trim()}
                    className="inline-flex items-center gap-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-sm rounded-lg px-3 py-1.5">
                    Answer
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
