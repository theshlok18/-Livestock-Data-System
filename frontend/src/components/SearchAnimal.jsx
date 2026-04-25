import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from './Navbar'
import ExportMenu from './ExportMenu'

export default function SearchAnimal() {
  const [tagNo, setTagNo]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [result, setResult]   = useState(null)
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    const tag = tagNo.trim().toUpperCase()
    if (!tag) return
    setError(''); setResult(null); setLoading(true)
    try {
      const res = await api.get(`/animal/${tag}`)
      if (res.data.found) setResult(res.data.animal)
    } catch (err) {
      if (err.response?.status === 404)
        setError(`No animal found with tag "${tag}". Check the tag number and try again.`)
      else setError(err.response?.data?.error || 'Search failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-4 py-10 page-enter">
        <div className="w-full max-w-lg">

          {/* Page title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
              style={{ background: '#eff6ff', border: '2px solid #bfdbfe', boxShadow: '0 4px 0 #bfdbfe' }}>
              🔍
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">Find an Animal</h1>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Enter the animal's tag number to view its records, add a new monthly entry, or download reports.
            </p>
          </div>

          <div className="card p-6 sm:p-8 mb-4">
            {error && (
              <div className="rounded-2xl px-4 py-4 mb-5 pop-in" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                <div className="flex items-start gap-2 text-sm font-medium mb-2" style={{ color: '#991b1b' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
                <button onClick={() => navigate('/new-entry')}
                  className="text-xs font-bold hover:underline" style={{ color: '#16a34a' }}>
                  → Register this as a new animal
                </button>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="form-label">Animal Tag Number</label>
                <input type="text" value={tagNo}
                  onChange={e => { setTagNo(e.target.value.toUpperCase()); setError(''); setResult(null) }}
                  className="input-field font-mono text-xl tracking-widest text-center uppercase py-4"
                  placeholder="e.g. TAG001"
                  autoFocus autoCapitalize="characters" required />
              </div>
              <button type="submit" disabled={loading || !tagNo.trim()}
                className="btn w-full py-3.5 text-base font-bold text-white"
                style={{ background: 'linear-gradient(160deg,#60a5fa,#2563eb)', boxShadow: '0 4px 0 #1e3a8a, 0 6px 20px rgba(37,99,235,.35)' }}>
                {loading
                  ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Searching...</>
                  : 'Search Animal'
                }
              </button>
            </form>

            {/* Sample tags */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center mb-2">Try a sample tag:</p>
              <div className="flex justify-center gap-2">
                {['TAG001', 'TAG002'].map(t => (
                  <button key={t} onClick={() => setTagNo(t)}
                    className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:scale-105"
                    style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', boxShadow: '0 2px 0 #bfdbfe' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search result */}
          {result && (
            <div className="card overflow-hidden pop-in">
              {/* Result header */}
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg,#14532d,#16a34a)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl">
                    {result.animal_type === 'Buffalo' ? '🐃' : '🐄'}
                  </div>
                  <div>
                    <div className="font-mono font-black text-white text-base">{result.tag_no}</div>
                    <div className="text-green-200/80 text-xs font-medium">
                      {result.animal_type} · {result.breed} · Age: {result.age || 'Unknown'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,.2)', color: 'white', border: '1px solid rgba(255,255,255,.3)' }}>
                  ✓ Found
                </span>
              </div>

              {/* Owner details */}
              <div className="p-5 grid grid-cols-2 gap-4 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Owner</div>
                  <div className="font-bold text-slate-700">{result.owner_name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Village</div>
                  <div className="font-bold text-slate-700">{result.village || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Mobile</div>
                  <div className="font-bold text-slate-700">{result.mobile_no || result.contact || '—'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">Body Weight</div>
                  <div className="font-bold text-slate-700">{result.body_weight ? `${result.body_weight} kg` : '—'}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">What do you want to do?</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button onClick={() => navigate(`/form/${result.tag_no}`)} className="btn-primary justify-center py-2.5 text-xs">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Add Monthly Record
                  </button>
                  <button onClick={() => navigate(`/history/${result.tag_no}`)} className="btn-secondary justify-center py-2.5 text-xs">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    View History
                  </button>
                  <div className="flex justify-center">
                    <ExportMenu type="animal" id={result.tag_no} label="Download Report" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help */}
          {!result && !error && (
            <div className="card p-4 flex items-start gap-3" style={{ borderLeft: '4px solid #bfdbfe' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-800">Tip: </span>
                The tag number is printed on the ear tag attached to the animal.
                If the animal isn't registered yet, use{' '}
                <button onClick={() => navigate('/new-entry')} className="font-bold hover:underline" style={{ color: '#16a34a' }}>
                  New Entry
                </button> to register it first.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
