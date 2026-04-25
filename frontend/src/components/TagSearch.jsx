import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import Navbar from './Navbar'

export default function TagSearch() {
  const [tagNo, setTagNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isHistory = searchParams.get('mode') === 'history'

  const handleSearch = async e => {
    e.preventDefault()
    const tag = tagNo.trim().toUpperCase()
    if (!tag) return
    setError('')
    setLoading(true)
    try {
      const res = await api.get(`/animal/${tag}`)
      if (res.data.found) navigate(isHistory ? `/history/${tag}` : `/form/${tag}`)
    } catch (err) {
      if (err.response?.status === 404) {
        if (isHistory) setError(`No animal found with tag "${tag}".`)
        else navigate(`/form/${tag}?new=true`)
      } else {
        setError(err.response?.data?.error || 'Search failed. Please try again.')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-4 py-8 page-enter">
        <div className="w-full max-w-md">

          {/* Icon + heading */}
          <div className="text-center mb-7">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-4 shadow-lg shadow-emerald-200">
              {isHistory ? '📋' : '🏷️'}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              {isHistory ? 'View Animal History' : 'Animal Tag Search'}
            </h1>
            <p className="text-slate-500 mt-2 text-sm px-4">
              {isHistory
                ? 'Enter the tag number to view all monthly records'
                : 'Existing tags load instantly — new tags open a blank form'}
            </p>
          </div>

          <div className="card p-5 sm:p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="form-label">Tag Number</label>
                <input
                  type="text"
                  value={tagNo}
                  onChange={e => setTagNo(e.target.value.toUpperCase())}
                  className="input-field font-mono text-lg sm:text-xl tracking-widest text-center uppercase"
                  placeholder="TAG001"
                  autoFocus
                  autoCapitalize="characters"
                  required
                />
              </div>
              <button type="submit" disabled={loading || !tagNo.trim()}
                className="w-full btn-primary justify-center py-3 text-base">
                {loading
                  ? <><span className="animate-spin">⏳</span> Searching...</>
                  : isHistory ? '📋 View History' : '🔍 Search / Create'
                }
              </button>
            </form>

            {!isHistory && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 text-xs text-slate-500">
                <span className="text-base flex-shrink-0">💡</span>
                <span><strong className="text-slate-600">Tip:</strong> If the tag exists, the form opens prefilled. If not, a blank registration form opens.</span>
              </div>
            )}
          </div>

          {/* Sample tags */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-400 mb-2">Try a sample tag:</p>
            <div className="flex justify-center gap-2">
              {['TAG001','TAG002'].map(t => (
                <button key={t} onClick={() => setTagNo(t)}
                  className="font-mono text-xs bg-white border border-slate-200 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition font-semibold shadow-sm">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
