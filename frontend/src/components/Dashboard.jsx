import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from './Navbar'

function StatCard({ icon, label, value, desc, color, loading }) {
  return (
    <div className="card p-5 flex items-start gap-4 card-lift" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: color + '18', border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-black text-slate-800 leading-none mb-0.5">
          {loading ? <span className="text-slate-200 animate-pulse">—</span> : value}
        </div>
        <div className="text-sm font-bold text-slate-600">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
      </div>
    </div>
  )
}

function ActionCard({ icon, label, desc, hint, color, onClick }) {
  return (
    <button onClick={onClick}
      className="card card-lift p-5 text-left w-full group flex items-start gap-4"
      style={{ borderLeft: `4px solid ${color}` }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{ background: color + '18', border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-slate-800 text-sm">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
        {hint && <div className="text-xs mt-1.5 font-semibold" style={{ color }}>{hint}</div>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round"
        className="flex-shrink-0 mt-0.5 group-hover:stroke-slate-400 group-hover:translate-x-0.5 transition-all">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    </button>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [stats, setStats]     = useState({ animals: 0, records: 0, drafts: 0 })
  const [recent, setRecent]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stats')
      .then(r => { setStats(r.data.stats || {}); setRecent(r.data.recent || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="page-wrap page-enter">

        {/* Welcome */}
        <div className="relative rounded-3xl p-6 sm:p-8 mb-7 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#14532d 0%,#16a34a 60%,#0d9488 100%)', boxShadow: '0 4px 0 #052e16, 0 12px 40px rgba(22,163,74,.3)' }}>
          <div className="absolute inset-0 opacity-[.04]"
            style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-green-300/80 text-sm font-semibold mb-1">{greeting()} 👋</p>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
                {user.full_name || user.username}
              </h1>
              <p className="text-green-100/60 text-sm">
                Livestock Animal Data Digitization System
              </p>
            </div>
            <button onClick={() => navigate('/new-entry')}
              className="self-start sm:self-auto flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-2xl text-white border border-white/20 transition-all hover:bg-white/15 active:scale-95"
              style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 0 rgba(0,0,0,.15)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Register New Animal
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon="🐄" label="Total Animals" value={stats.animals ?? 0}
            desc="Animals registered in the system" color="#16a34a" loading={loading} />
          <StatCard icon="📋" label="Monthly Records" value={stats.records ?? 0}
            desc="Submitted production records" color="#2563eb" loading={loading} />
          <StatCard icon="📝" label="Drafts Pending" value={stats.drafts ?? 0}
            desc="Saved drafts waiting to submit" color="#d97706" loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* What can you do */}
          <div>
            <div className="mb-4">
              <h2 className="text-base font-black text-slate-700">What would you like to do?</h2>
              <p className="text-xs text-slate-400 mt-0.5">Choose an action to get started</p>
            </div>
            <div className="space-y-3">
              <ActionCard icon="➕" label="Register New Animal"
                desc="Add a new animal to the system with its tag number, breed, and owner details"
                hint="First time? Start here →"
                color="#16a34a" onClick={() => navigate('/new-entry')} />
              <ActionCard icon="🔍" label="Find Existing Animal"
                desc="Search by tag number to add a monthly record or view past data"
                color="#2563eb" onClick={() => navigate('/search')} />
              <ActionCard icon="🌾" label="Record Feeding"
                desc="Log today's feed intake — type, quantity, and cost per animal"
                color="#d97706" onClick={() => navigate('/feeding')} />
              <ActionCard icon="📊" label="View History"
                desc="Browse all monthly production records for any animal"
                color="#7c3aed" onClick={() => navigate('/search')} />
            </div>
          </div>

          {/* Recent activity */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-slate-700">Recent Activity</h2>
                <p className="text-xs text-slate-400 mt-0.5">Latest records entered in the system</p>
              </div>
              <button onClick={() => navigate('/search')}
                className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                style={{ color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                View all →
              </button>
            </div>

            <div className="card overflow-hidden">
              {loading ? (
                <div className="p-10 text-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" className="animate-spin mx-auto mb-3">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  <p className="text-slate-400 text-sm">Loading recent records...</p>
                </div>
              ) : recent.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-3xl">📭</div>
                  <p className="text-slate-700 font-bold mb-1">No records yet</p>
                  <p className="text-slate-400 text-sm mb-4">
                    Start by registering your first animal, then add monthly production data.
                  </p>
                  <button onClick={() => navigate('/new-entry')} className="btn-primary mx-auto text-sm">
                    Register First Animal
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60">
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Tag No</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Animal</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Record Date</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Milk/Day</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Health</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">Status</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {recent.map((r, i) => (
                          <tr key={r.id} className={`hover:bg-green-50/30 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                            <td className="px-4 py-3">
                              <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg"
                                style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                                {r.tag_no}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-600">{r.animal_type || '—'}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.record_date}</td>
                            <td className="px-4 py-3 font-bold text-slate-800 text-sm">
                              {r.milk_per_day != null ? `${r.milk_per_day} L` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={r.health_status === 'Healthy' ? 'badge-green' : r.health_status === 'Sick' ? 'badge-red' : r.health_status ? 'badge-amber' : 'badge-gray'}>
                                {r.health_status || 'Not set'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {r.is_draft
                                ? <span className="badge-amber">Draft — not submitted</span>
                                : <span className="badge-green">✓ Submitted</span>
                              }
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => navigate(`/history/${r.tag_no}`)}
                                className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all"
                                style={{ color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                                View →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="sm:hidden divide-y divide-slate-50">
                    {recent.map(r => (
                      <div key={r.id} className="px-4 py-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg"
                              style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                              {r.tag_no}
                            </span>
                            <span className="text-xs font-mono text-slate-400">{r.record_date}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-slate-500">{r.animal_type || '—'}</span>
                            {r.milk_per_day != null && (
                              <span className="text-xs font-bold" style={{ color: '#2563eb' }}>{r.milk_per_day} L/day</span>
                            )}
                            <span className={r.health_status === 'Healthy' ? 'badge-green' : 'badge-gray'}>
                              {r.health_status || 'No health data'}
                            </span>
                          </div>
                        </div>
                        <button onClick={() => navigate(`/history/${r.tag_no}`)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-xl flex-shrink-0"
                          style={{ color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Help tip */}
        <div className="mt-6 card p-4 flex items-start gap-3" style={{ borderLeft: '4px solid #bfdbfe' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-800">How it works: </span>
            First <span className="font-semibold text-green-700">register an animal</span> with its tag number.
            Then each month, <span className="font-semibold text-blue-700">search by tag</span> and add a monthly record with milk production, health, and feeding data.
          </p>
        </div>

      </div>
    </div>
  )
}
