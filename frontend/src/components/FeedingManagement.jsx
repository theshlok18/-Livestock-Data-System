import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import feedData from '../config/feedData.json'

const CLASSES = feedData.feed_data
const UNITS   = ['Kg', 'g', 'L', 'mL']

const getSubclasses = fc  => CLASSES.find(c => c.feed_class === fc)?.subclasses || []
const getFeeds      = (fc,sc) => getSubclasses(fc).find(s => s.feed_subclass === sc)?.feeds || []
const calcAmt       = (r,q) => +(( parseFloat(r)||0 ) * ( parseFloat(q)||0 )).toFixed(2)

let _id = 1
const emptyRow = () => ({ id: _id++, feed_class:'', feed_subclass:'', feed_name:'', rate:'', quantity:'', unit:'Kg', amount:0 })

const CLASS_STYLE = {
  'Concentrate':          { grad:'from-blue-500 to-indigo-500',   bg:'bg-blue-50',   text:'text-blue-700',   border:'border-blue-200',   bar:'bg-blue-500'   },
  'Roughage':             { grad:'from-emerald-500 to-teal-500',  bg:'bg-emerald-50',text:'text-emerald-700',border:'border-emerald-200',bar:'bg-emerald-500'},
  'Mineral & Supplement': { grad:'from-purple-500 to-violet-500', bg:'bg-purple-50', text:'text-purple-700', border:'border-purple-200', bar:'bg-purple-500' },
}
const cls = fc => CLASS_STYLE[fc] || { grad:'from-slate-400 to-slate-500', bg:'bg-slate-50', text:'text-slate-600', border:'border-slate-200', bar:'bg-slate-400' }

function FSelect({ value, onChange, options, placeholder, disabled }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
      className={`w-full rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none
        ${disabled ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white/80 border-slate-200 text-slate-700 hover:border-emerald-400 cursor-pointer'}`}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function FNum({ value, onChange, placeholder, readOnly, highlight }) {
  return (
    <input type="number" min="0" step="0.01" value={value} onChange={e=>onChange(e.target.value)}
      readOnly={readOnly} placeholder={placeholder||'0'}
      className={`w-full rounded-2xl border px-3 py-2.5 text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400
        ${readOnly
          ? highlight ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-default' : 'bg-slate-100 border-slate-200 text-slate-500 cursor-default'
          : 'bg-white/80 border-slate-200 text-slate-700 hover:border-emerald-400'}`} />
  )
}

export default function FeedingManagement() {
  const navigate = useNavigate()
  const [rows, setRows]     = useState([emptyRow()])
  const [tagNo, setTagNo]   = useState('')
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0])
  const [saved, setSaved]   = useState(false)
  const [errors, setErrors] = useState({})

  const updateRow = useCallback((id, field, value) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row
      const u = { ...row, [field]: value }
      if (field === 'feed_class')    { u.feed_subclass=''; u.feed_name=''; u.unit='Kg' }
      if (field === 'feed_subclass') { u.feed_name=''; const f=getFeeds(u.feed_class,value); if(f.length) u.unit=f[0].unit||'Kg' }
      if (field === 'feed_name')     { const f=getFeeds(u.feed_class,u.feed_subclass).find(x=>x.feed_name===value); if(f) u.unit=f.unit||'Kg' }
      u.amount = calcAmt(field==='rate'?value:u.rate, field==='quantity'?value:u.quantity)
      return u
    }))
    setErrors(p => { const n={...p}; delete n[`${id}_${field}`]; return n })
  }, [])

  const addRow    = () => setRows(p => [...p, emptyRow()])
  const removeRow = id => setRows(p => p.filter(r => r.id !== id))
  const clearAll  = () => { setRows([emptyRow()]); setSaved(false); setErrors({}) }

  const validate = () => {
    const e = {}
    if (!tagNo.trim()) e.tagNo = true
    rows.forEach(r => {
      if (!r.feed_class)    e[`${r.id}_feed_class`]    = true
      if (!r.feed_subclass) e[`${r.id}_feed_subclass`] = true
      if (!r.feed_name)     e[`${r.id}_feed_name`]     = true
    })
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSave = () => {
    if (!validate()) return
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const totalQty    = rows.reduce((s,r) => s+(parseFloat(r.quantity)||0), 0)
  const totalAmount = rows.reduce((s,r) => s+(r.amount||0), 0)

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <div className="page-wrap page-enter">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-200">🌾</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">Feeding Management</h1>
              <p className="text-slate-500 text-sm mt-0.5">Record daily feed intake for an animal</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="btn-secondary self-start sm:self-auto">← Back</button>
        </div>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3.5 mb-5 text-sm flex items-center gap-2 pop-in font-semibold">
            ✅ Feeding record saved successfully!
          </div>
        )}

        {/* Animal + Date */}
        <div className="card p-5 sm:p-6 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Animal Tag No <span className="text-red-400">*</span></label>
              <input type="text" value={tagNo}
                onChange={e => { setTagNo(e.target.value.toUpperCase()); setErrors(p=>{const n={...p};delete n.tagNo;return n}) }}
                placeholder="e.g. TAG001"
                className={`input-field font-mono uppercase tracking-widest text-lg py-3 ${errors.tagNo?'border-red-400 ring-2 ring-red-200':''}`} />
              {errors.tagNo && <p className="text-xs text-red-500 mt-1 font-semibold">Tag number is required</p>}
            </div>
            <div>
              <label className="form-label">Feeding Date <span className="text-red-400">*</span></label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="input-field py-3" />
            </div>
          </div>
        </div>

        {/* Feed rows */}
        <div className="card overflow-hidden mb-5">
          {/* Desktop header */}
          <div className="hidden lg:grid grid-cols-[2fr_2fr_2.5fr_1.2fr_1.2fr_1fr_1.3fr_44px] gap-2 px-5 py-3.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white text-xs font-bold uppercase tracking-widest">
            {['Feed Class','Sub Class','Feed Name','Rate (₹)','Quantity','Unit','Amount (₹)',''].map(h=><span key={h}>{h}</span>)}
          </div>

          <div className="divide-y divide-slate-100">
            {rows.map((row, idx) => {
              const cs = cls(row.feed_class)
              return (
                <div key={row.id} className={`px-4 sm:px-5 py-4 transition-colors ${idx%2===1?'bg-slate-50/50':'bg-white'}`}>
                  {/* Mobile header */}
                  <div className="flex items-center justify-between mb-3 lg:hidden">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${cs.grad} text-white text-xs font-black flex items-center justify-center shadow-sm`}>{idx+1}</div>
                      {row.feed_class && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cs.bg} ${cs.text} border ${cs.border}`}>{row.feed_class}</span>}
                    </div>
                    {rows.length > 1 && (
                      <button onClick={()=>removeRow(row.id)} className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-xl transition">✕ Remove</button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_2fr_2.5fr_1.2fr_1.2fr_1fr_1.3fr_44px] gap-2 items-start">
                    <div>
                      <label className="form-label lg:hidden">Feed Class *</label>
                      <FSelect value={row.feed_class} onChange={v=>updateRow(row.id,'feed_class',v)} options={CLASSES.map(c=>c.feed_class)} placeholder="Select Class" />
                      {errors[`${row.id}_feed_class`] && <p className="text-xs text-red-500 mt-0.5 font-semibold">Required</p>}
                    </div>
                    <div>
                      <label className="form-label lg:hidden">Sub Class *</label>
                      <FSelect value={row.feed_subclass} onChange={v=>updateRow(row.id,'feed_subclass',v)} options={getSubclasses(row.feed_class).map(s=>s.feed_subclass)} placeholder="Select Sub Class" disabled={!row.feed_class} />
                      {errors[`${row.id}_feed_subclass`] && <p className="text-xs text-red-500 mt-0.5 font-semibold">Required</p>}
                    </div>
                    <div>
                      <label className="form-label lg:hidden">Feed Name *</label>
                      <FSelect value={row.feed_name} onChange={v=>updateRow(row.id,'feed_name',v)} options={getFeeds(row.feed_class,row.feed_subclass).map(f=>f.feed_name)} placeholder="Select Feed" disabled={!row.feed_subclass} />
                      {errors[`${row.id}_feed_name`] && <p className="text-xs text-red-500 mt-0.5 font-semibold">Required</p>}
                    </div>
                    <div>
                      <label className="form-label lg:hidden">Rate (₹)</label>
                      <FNum value={row.rate} onChange={v=>updateRow(row.id,'rate',v)} placeholder="Rate" />
                    </div>
                    <div>
                      <label className="form-label lg:hidden">Quantity</label>
                      <FNum value={row.quantity} onChange={v=>updateRow(row.id,'quantity',v)} placeholder="Qty" />
                    </div>
                    <div>
                      <label className="form-label lg:hidden">Unit</label>
                      <FSelect value={row.unit} onChange={v=>updateRow(row.id,'unit',v)} options={UNITS} placeholder="" />
                    </div>
                    <div>
                      <label className="form-label lg:hidden">Amount (₹)</label>
                      <FNum value={row.amount||''} onChange={()=>{}} readOnly highlight={row.amount>0} placeholder="0.00" />
                    </div>
                    <div className="hidden lg:flex items-center justify-center">
                      {rows.length > 1
                        ? <button onClick={()=>removeRow(row.id)} className="w-9 h-9 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 transition flex items-center justify-center font-black text-sm">✕</button>
                        : <div className="w-9 h-9" />
                      }
                    </div>
                  </div>

                  {row.amount > 0 && (
                    <div className="lg:hidden mt-2 flex justify-end items-center gap-1">
                      <span className="text-xs text-slate-400 font-medium">Amount:</span>
                      <span className="text-sm font-black text-emerald-700">₹{row.amount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add row */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <button onClick={addRow}
              className="flex items-center gap-2.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-2xl transition-all duration-200 group">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-lg leading-none shadow-md shadow-emerald-200 group-hover:scale-110 transition-transform">+</div>
              Add Feed Row
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="card p-5 sm:p-6 mb-5">
          <p className="section-title mb-4">Summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label:'Total Rows',   value:rows.length,           unit:'',       grad:'from-slate-500 to-slate-600',   bg:'bg-slate-50',   text:'text-slate-700'   },
              { label:'Total Qty',    value:totalQty.toFixed(2),   unit:'mixed',  grad:'from-emerald-500 to-teal-500',  bg:'bg-emerald-50', text:'text-emerald-700' },
              { label:'Total Amount', value:`₹${totalAmount.toFixed(2)}`, unit:'', grad:'from-amber-400 to-orange-500', bg:'bg-amber-50',   text:'text-amber-700'   },
              { label:'Date',         value:date,                  unit:tagNo||'—', grad:'from-blue-500 to-indigo-500', bg:'bg-blue-50',    text:'text-blue-700'    },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center relative overflow-hidden`}>
                <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${s.grad} opacity-10`} />
                <div className={`text-xl sm:text-2xl font-black ${s.text} mb-0.5`}>{s.value}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.label}</div>
                {s.unit && <div className="text-xs text-slate-400 mt-0.5">{s.unit}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        {rows.some(r => r.feed_class && r.amount > 0) && (
          <div className="card p-5 sm:p-6 mb-5">
            <p className="section-title mb-4">Cost Breakdown by Class</p>
            <div className="space-y-3">
              {CLASSES.map(c => {
                const clsRows = rows.filter(r => r.feed_class===c.feed_class && r.amount>0)
                if (!clsRows.length) return null
                const total = clsRows.reduce((s,r)=>s+r.amount,0)
                const pct   = totalAmount>0 ? (total/totalAmount)*100 : 0
                const cs    = cls(c.feed_class)
                return (
                  <div key={c.feed_class}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cs.bg} ${cs.text} border ${cs.border}`}>{c.feed_class}</span>
                      <span className="font-black text-slate-700 text-sm">₹{total.toFixed(2)} <span className="text-slate-400 font-semibold text-xs">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cs.bar} transition-all duration-700`} style={{width:`${pct}%`}} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="action-row">
          <button onClick={handleSave} className="btn-primary flex-1 sm:flex-none justify-center py-3 text-base">💾 Save Feeding Record</button>
          <button onClick={clearAll}   className="btn-secondary flex-1 sm:flex-none justify-center">🔄 Clear All</button>
          <button onClick={()=>window.print()} className="btn-secondary flex-1 sm:flex-none justify-center">🖨️ Print</button>
        </div>
      </div>
    </div>
  )
}
