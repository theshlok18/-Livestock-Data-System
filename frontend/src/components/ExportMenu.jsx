import React, { useState, useRef, useEffect } from 'react'
import api from '../utils/api'

/**
 * ExportMenu — dropdown with PDF + Excel download options.
 *
 * Props:
 *   type:     'record' | 'animal'
 *   id:       record id (when type='record') OR tag_no string (when type='animal')
 *   label:    optional button label override
 *   size:     'sm' | 'md' (default 'md')
 */
export default function ExportMenu({ type, id, label, size = 'md' }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(null) // 'pdf' | 'excel' | null
  const [error, setError]     = useState('')
  const ref = useRef()

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const download = async (format) => {
    setLoading(format)
    setError('')
    setOpen(false)
    try {
      const url = type === 'record'
        ? `/export/record/${id}/${format}`
        : `/export/animal/${id}/${format}`

      const mime = format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

      const ext  = format === 'pdf' ? 'pdf' : 'xlsx'
      const name = type === 'record' ? `record_${id}` : `history_${id}`

      const res = await api.get(url, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: mime })
      const href = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = href
      a.download = `${name}.${ext}`
      a.click()
      URL.revokeObjectURL(href)
    } catch (err) {
      setError(`${format.toUpperCase()} export failed.`)
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(null)
    }
  }

  const btnCls = size === 'sm'
    ? 'text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition'
    : 'text-sm px-3 py-2 rounded-xl font-medium flex items-center gap-2 transition'

  return (
    <div className="relative inline-block" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        disabled={!!loading}
        className={`${btnCls} bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50`}
        title="Download"
      >
        {loading
          ? <><span className="animate-spin">⏳</span> {loading === 'pdf' ? 'PDF…' : 'Excel…'}</>
          : <><span>⬇️</span> {label || 'Download'} <span className="opacity-60 text-xs">▾</span></>
        }
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Download as</p>
          </div>
          <button
            onClick={() => download('pdf')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition text-left group"
          >
            <span className="text-xl">📄</span>
            <div>
              <div className="text-sm font-semibold text-slate-700 group-hover:text-red-700">PDF</div>
              <div className="text-xs text-slate-400">Printable report</div>
            </div>
          </button>
          <button
            onClick={() => download('excel')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition text-left group border-t border-slate-50"
          >
            <span className="text-xl">📊</span>
            <div>
              <div className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">Excel (.xlsx)</div>
              <div className="text-xs text-slate-400">Spreadsheet with filters</div>
            </div>
          </button>
        </div>
      )}

      {/* Inline error toast */}
      {error && (
        <div className="absolute right-0 mt-1 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-50 whitespace-nowrap">
          ⚠️ {error}
        </div>
      )}
    </div>
  )
}
