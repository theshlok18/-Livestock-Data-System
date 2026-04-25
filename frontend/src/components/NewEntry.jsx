import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from './Navbar'

export default function NewEntry() {
  const [tagNo, setTagNo]       = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    const tag = tagNo.trim().toUpperCase()
    if (!tag) return
    setError(''); setChecking(true)
    try {
      await api.get(`/animal/${tag}`)
      // Tag already exists
      setError(`Tag "${tag}" is already registered. Use "Search Animal" to find it and add a monthly record.`)
      setChecking(false)
    } catch (err) {
      if (err.response?.status === 404) navigate(`/form/${tag}?new=true`)
      else { setError(err.response?.data?.error || 'Something went wrong.'); setChecking(false) }
    }
  }

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-4 py-10 page-enter">
        <div className="w-full max-w-lg">

          {/* Page title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
              style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', boxShadow: '0 4px 0 #bbf7d0' }}>
              🐄
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">Register a New Animal</h1>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Enter a unique tag number for the animal. This tag will be used to identify the animal in all future records.
            </p>
          </div>

          <div className="card p-6 sm:p-8 mb-4">

            {/* What is a tag number */}
            <div className="rounded-2xl p-4 mb-6 flex items-start gap-3"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <div className="text-sm text-green-800">
                <span className="font-bold">What is a Tag Number?</span> It's a unique ID attached to the animal's ear tag.
                Example: <span className="font-mono font-bold">TAG001</span>, <span className="font-mono font-bold">MH2024001</span>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl px-4 py-4 mb-5 pop-in" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                <div className="flex items-start gap-2 text-sm font-medium mb-3" style={{ color: '#92400e' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>{error}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate('/search')} className="btn-primary text-xs py-2 px-3">
                    Search Existing Animal
                  </button>
                  <button onClick={() => { setError(''); setTagNo('') }} className="btn-secondary text-xs py-2 px-3">
                    Try Different Tag
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="form-label">Animal Tag Number</label>
                <input type="text" value={tagNo}
                  onChange={e => { setTagNo(e.target.value.toUpperCase()); setError('') }}
                  className="input-field font-mono text-xl tracking-widest text-center uppercase py-4"
                  placeholder="e.g. TAG001"
                  autoFocus autoCapitalize="characters" required />
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Use capital letters and numbers only. No spaces.
                </p>
              </div>
              <button type="submit" disabled={checking || !tagNo.trim()} className="btn-primary w-full py-3.5 text-base">
                {checking
                  ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Checking tag...</>
                  : <>Continue to Registration Form →</>
                }
              </button>
            </form>
          </div>

          {/* Steps preview */}
          <div className="card p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What happens next</p>
            <div className="space-y-3">
              {[
                { step: '1', label: 'Enter tag number', done: !!tagNo, active: !tagNo },
                { step: '2', label: 'Fill in animal details (owner, breed, age)', done: false, active: !!tagNo },
                { step: '3', label: 'Add first monthly production record', done: false, active: false },
              ].map(s => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    s.done ? 'bg-green-500 text-white' : s.active ? 'bg-green-100 text-green-700 border-2 border-green-400' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {s.done ? '✓' : s.step}
                  </div>
                  <span className={`text-sm font-medium ${s.done ? 'text-green-700 line-through' : s.active ? 'text-slate-800' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
