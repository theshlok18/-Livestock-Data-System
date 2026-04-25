import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Login() {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await api.post('/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: '#f4f6fb' }}>

      {/* ── Left hero ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg,#14532d 0%,#16a34a 55%,#0d9488 100%)' }}>
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle,#fff,transparent)', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle,#fff,transparent)', transform: 'translate(-30%,30%)' }} />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[.06]"
            style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center"
              style={{ boxShadow: '0 4px 0 rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.2)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-black text-lg leading-none">LivestockDS</div>
              <div className="text-green-200/70 text-xs mt-0.5 font-medium">Animal Data System</div>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight">
            Digitize Your<br />
            <span style={{ color: '#a7f3d0' }}>Livestock Records</span>
          </h1>
          <p className="text-green-100/70 text-base leading-relaxed max-w-xs">
            Track animals, monthly production, health data, and feeding records — all in one modern platform.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { icon: '📋', t: 'Records',   s: 'Monthly data'  },
            { icon: '📊', t: 'Analytics', s: 'Live stats'    },
            { icon: '📄', t: 'Export',    s: 'PDF & Excel'   },
          ].map(item => (
            <div key={item.t} className="rounded-2xl p-4 border border-white/10"
              style={{ background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 0 rgba(0,0,0,.15), inset 0 1px 0 rgba(255,255,255,.1)' }}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-bold text-white text-sm">{item.t}</div>
              <div className="text-green-200/60 text-xs mt-0.5">{item.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-sm sm:max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 3px 0 #14532d' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div className="font-black text-slate-800 text-lg">LivestockDS</div>
              <div className="text-slate-400 text-xs font-medium">Animal Data System</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mb-2">Welcome back 👋</h2>
            <p className="text-slate-500 font-medium">Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="rounded-2xl px-4 py-3.5 mb-6 text-sm flex items-center gap-2.5 pop-in font-medium"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <div className="card p-6 sm:p-8">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="form-label">Username</label>
                <input type="text" value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="input-field text-base" placeholder="Enter username"
                  autoComplete="username" autoFocus required />
              </div>
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="input-field text-base pr-12" placeholder="Enter password"
                    autoComplete="current-password" required />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1">
                    {showPass
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-1">
                {loading
                  ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Signing in...</>
                  : <>Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                }
              </button>
            </form>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6 font-medium">Livestock Animal Data Digitization System · v2.0</p>
        </div>
      </div>
    </div>
  )
}
