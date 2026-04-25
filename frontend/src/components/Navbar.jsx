import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../utils/api'

/* ── tiny SVG icon helper ─────────────────────────────────────────────────── */
function Ic({ d, size = 16, stroke = 'currentColor', sw = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

/* ── nav links ────────────────────────────────────────────────────────────── */
const LINKS = [
  {
    to: '/', label: 'Dashboard',
    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  },
  {
    to: '/new-entry', label: 'New Entry',
    icon: 'M12 5v14M5 12h14',
  },
  {
    to: '/search', label: 'Search',
    icon: 'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
  },
  {
    to: '/feeding', label: 'Feeding',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  },
]

/* ── change-password modal ────────────────────────────────────────────────── */
function ChangePasswordModal({ onClose }) {
  const [form, setForm]     = useState({ current_password: '', new_password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  const submit = async e => {
    e.preventDefault()
    if (form.new_password !== form.confirm) { setError('New passwords do not match'); return }
    if (form.new_password.length < 6)       { setError('Password must be at least 6 characters'); return }
    setError(''); setLoading(true)
    try {
      await api.post('/profile/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      })
      setSuccess('Password changed successfully!')
      setTimeout(onClose, 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 pop-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-slate-800 text-lg">Change Password</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition text-slate-500">
            <Ic d="M6 18L18 6M6 6l12 12" size={14} sw={2.5} />
          </button>
        </div>

        {error && (
          <div className="rounded-xl px-3 py-2.5 mb-4 text-xs font-semibold flex items-center gap-2"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
            <Ic d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={14} />
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl px-3 py-2.5 mb-4 text-xs font-semibold flex items-center gap-2"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
            <Ic d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={14} />
            {success}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {[
            { label: 'Current Password', key: 'current_password' },
            { label: 'New Password',     key: 'new_password'     },
            { label: 'Confirm New',      key: 'confirm'          },
          ].map(f => (
            <div key={f.key}>
              <label className="form-label">{f.label}</label>
              <input type="password" value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="input-field" placeholder="••••••••" required />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5">
              {loading
                ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Saving...</>
                : 'Save Password'
              }
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── profile dropdown ─────────────────────────────────────────────────────── */
function ProfileDropdown({ user, onClose, onChangePassword, onLogout }) {
  const ref = useRef()

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const initials = (user.full_name || user.username || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const roleColor = user.role === 'admin'
    ? { bg: '#fef3c7', text: '#92400e', border: '#fde68a' }
    : { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' }

  return (
    <div ref={ref}
      className="absolute right-0 top-full mt-2 w-72 bg-white rounded-3xl border border-slate-100 z-50 overflow-hidden slide-down"
      style={{ boxShadow: '0 8px 0 rgba(0,0,0,.06), 0 20px 60px rgba(0,0,0,.15)' }}>

      {/* Profile header */}
      <div className="p-5 border-b border-slate-100"
        style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 3px 0 #14532d' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-black text-slate-800 text-sm truncate">{user.full_name || user.username}</div>
            <div className="text-xs text-slate-500 font-medium truncate">@{user.username}</div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mt-1 border capitalize"
              style={{ background: roleColor.bg, color: roleColor.text, borderColor: roleColor.border }}>
              {user.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="p-2">
        <button onClick={onChangePassword}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all text-left group">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
            style={{ border: '1px solid #bfdbfe' }}>
            <Ic d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={14} stroke="#2563eb" />
          </div>
          <div>
            <div>Change Password</div>
            <div className="text-xs text-slate-400 font-normal">Update your login password</div>
          </div>
        </button>

        <div className="h-px bg-slate-100 my-1.5 mx-2" />

        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all text-left group">
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
            style={{ border: '1px solid #fecaca' }}>
            <Ic d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" size={14} stroke="#dc2626" />
          </div>
          <div>
            <div>Sign Out</div>
            <div className="text-xs text-red-400 font-normal">Log out of your account</div>
          </div>
        </button>
      </div>
    </div>
  )
}

/* ── main Navbar ──────────────────────────────────────────────────────────── */
export default function Navbar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)
  const [showChangePw, setShowChangePw] = useState(false)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const active = to => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const initials = (user.full_name || user.username || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 no-print"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 3px 0 #14532d, 0 4px 12px rgba(22,163,74,.3)' }}>
                <Ic d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" size={18} stroke="white" sw={2.2} />
              </div>
              <div className="hidden sm:block">
                <div className="font-black text-slate-800 text-sm leading-none tracking-tight">LivestockDS</div>
                <div className="text-xs text-slate-400 leading-none mt-0.5 font-medium">Animal Data System</div>
              </div>
            </Link>

            {/* Desktop nav pill */}
            <div className="hidden md:flex items-center gap-0.5 rounded-2xl p-1"
              style={{ background: '#f1f5f9', boxShadow: 'inset 0 1px 3px rgba(0,0,0,.08)' }}>
              {LINKS.map(l => (
                <Link key={l.to} to={l.to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    active(l.to)
                      ? 'bg-white text-green-700'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                  }`}
                  style={active(l.to) ? { boxShadow: '0 1px 3px rgba(0,0,0,.1), 0 1px 0 rgba(255,255,255,.8) inset' } : {}}>
                  <span className="w-4 h-4 flex-shrink-0">
                    <Ic d={l.icon} size={15} />
                  </span>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Right — profile button */}
            <div className="flex items-center gap-2">
              {/* Profile button — desktop */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className={`flex items-center gap-2.5 rounded-2xl px-3 py-1.5 border transition-all duration-150 ${
                    profileOpen
                      ? 'bg-green-50 border-green-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                  style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,.04)' }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 2px 0 #14532d' }}>
                    {initials}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-slate-700 leading-none">{user.full_name || user.username}</div>
                    <div className="text-xs text-slate-400 capitalize leading-none mt-0.5">{user.role?.replace('_',' ')}</div>
                  </div>
                  <Ic d={profileOpen ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} size={13} stroke="#94a3b8" sw={2.5} />
                </button>

                {profileOpen && (
                  <ProfileDropdown
                    user={user}
                    onClose={() => setProfileOpen(false)}
                    onChangePassword={() => { setProfileOpen(false); setShowChangePw(true) }}
                    onLogout={logout}
                  />
                )}
              </div>

              {/* Mobile hamburger */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition border border-slate-200">
                <Ic d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18'} size={16} sw={2.5} />
              </button>
            </div>
          </div>

          {/* Mobile drawer */}
          {mobileOpen && (
            <div className="md:hidden border-t border-slate-100 py-3 pb-4 space-y-1 slide-down">
              {LINKS.map(l => (
                <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    active(l.to) ? 'bg-green-50 text-green-700 border border-green-100' : 'text-slate-600 hover:bg-slate-50'
                  }`}>
                  <span className="w-5 h-5 flex-shrink-0"><Ic d={l.icon} size={18} /></span>
                  {l.label}
                </Link>
              ))}

              {/* Mobile profile section */}
              <div className="border-t border-slate-100 mt-2 pt-3 px-2 space-y-1">
                {/* Profile info */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-green-50 border border-green-100 mb-1">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 2px 0 #14532d' }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800 truncate">{user.full_name || user.username}</div>
                    <div className="text-xs text-slate-500 capitalize">{user.role?.replace('_',' ')}</div>
                  </div>
                </div>

                <button onClick={() => { setMobileOpen(false); setShowChangePw(true) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition text-left">
                  <span className="w-5 h-5 flex-shrink-0"><Ic d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={18} /></span>
                  Change Password
                </button>

                <button onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition text-left">
                  <span className="w-5 h-5 flex-shrink-0"><Ic d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" size={18} stroke="#dc2626" /></span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Change password modal */}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </>
  )
}
