import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from './Navbar'
import DynamicForm from './DynamicForm'
import ExportMenu from './ExportMenu'

export default function HistoryViewer() {
  const { tagNo } = useParams()
  const navigate  = useNavigate()

  const [animal, setAnimal]       = useState(null)
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [selected, setSelected]   = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData]   = useState({})
  const [saving, setSaving]       = useState(false)
  const [deleteId, setDeleteId]   = useState(null)
  const [viewMode, setViewMode]   = useState('cards')

  useEffect(() => { fetchData() }, [tagNo])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ar, rr] = await Promise.all([api.get(`/animal/${tagNo}`), api.get(`/records/${tagNo}`)])
      if (ar.data.found) setAnimal(ar.data.animal)
      setRecords(rr.data.records || [])
    } catch (err) { setError(err.response?.data?.error || 'Failed to load.') }
    finally { setLoading(false) }
  }

  const startEdit = rec => { setEditingId(rec.id); setEditData({ ...rec }); setSelected(null) }
  const cancelEdit = () => { setEditingId(null); setEditData({}) }

  const saveEdit = async () => {
    setSaving(true)
    try { await api.put(`/record/${editingId}`, editData); cancelEdit(); fetchData() }
    catch (err) { alert(err.response?.data?.error || 'Update failed.') }
    finally { setSaving(false) }
  }

  const doDelete = async id => {
    try { await api.delete(`/record/${id}`); setDeleteId(null); setSelected(null); fetchData() }
    catch (err) { alert(err.response?.data?.error || 'Delete failed.') }
  }

  if (loading) return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-3">📋</div>
          <p className="text-slate-500 font-semibold">Loading records...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <div className="page-wrap page-enter">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 no-print">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Monthly Records — {tagNo}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              All monthly production, health, and feeding records for this animal
            </p>
            {animal && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl" style={{ background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0' }}>{tagNo}</span>
                <span className="text-sm text-slate-500">{animal.animal_type} · {animal.breed} · Owner: {animal.owner_name}</span>
              </div>
            )}
          </div>
          <div className="action-row">
            <button onClick={() => navigate(`/form/${tagNo}`)} className="btn-primary text-xs">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              Add Record
            </button>
            <ExportMenu type="animal" id={tagNo} label="Download All" />
            <button onClick={() => window.print()} className="btn-secondary text-xs">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
            <button onClick={() => navigate(-1)} className="btn-secondary text-xs">← Back</button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-5 text-sm">⚠️ {error}</div>}

        {/* Animal card */}
        {animal && (
          <div className="card p-4 sm:p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-100 overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                {animal.image_path
                  ? <img src={`/api/uploads/${animal.image_path}`} alt="Animal" className="w-full h-full object-cover" />
                  : <span className="text-3xl sm:text-4xl">🐄</span>
                }
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[['Tag No',animal.tag_no,true],['Type',animal.animal_type],['Breed',animal.breed],['Age',animal.age],['Owner',animal.owner_name],['Village',animal.village],['Contact',animal.contact]].map(([l,v,mono]) => (
                  <div key={l} className="min-w-0">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{l}</div>
                    <div className={`font-bold text-slate-700 text-sm truncate mt-0.5 ${mono ? 'font-mono text-emerald-700' : ''}`}>{v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">{records.length}</span>
            <span className="text-slate-500 text-sm">monthly record{records.length !== 1 ? 's' : ''} found</span>
            {records.length > 0 && <span className="text-xs text-slate-400 hidden sm:inline">· Most recent: {records[0]?.record_date}</span>}
          </div>
          <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl">
            {[['cards','🃏 Cards'],['table','📊 Table']].map(([m,l]) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === m ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Empty */}
        {records.length === 0 ? (
          <div className="card p-12 sm:p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-3xl">📭</div>
            <h3 className="text-lg font-black text-slate-700 mb-2">No monthly records yet</h3>
            <p className="text-slate-400 text-sm mb-2 max-w-xs mx-auto">
              Monthly records track milk production, health status, feeding, and other data for this animal each month.
            </p>
            <p className="text-slate-400 text-sm mb-6">Click the button below to add the first record.</p>
            <button onClick={() => navigate(`/form/${tagNo}`)} className="btn-primary mx-auto">
              Add First Monthly Record
            </button>
          </div>

        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {records.map(rec => (
              <div key={rec.id} className="card p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-mono font-black text-slate-800">{rec.record_date}</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-medium">{rec.officer_name || 'Unknown officer'}</div>
                  </div>
                  {rec.is_draft ? <span className="badge-yellow">Draft</span> : <span className="badge-green">✓ Done</span>}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[['🥛','Milk',rec.milk_per_day!=null?`${rec.milk_per_day}L`:'—'],
                    ['🧪','Fat',rec.fat!=null?`${rec.fat}%`:'—'],
                    ['💧','SNF',rec.snf!=null?`${rec.snf}%`:'—'],
                    ['💰','Rate',rec.rate!=null?`₹${rec.rate}`:'—'],
                    ['💸','Exp',rec.expenses!=null?`₹${rec.expenses}`:'—'],
                    ['❤️','Health',rec.health_status||'—'],
                  ].map(([icon,label,val]) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-2.5 text-center">
                      <div className="text-base mb-0.5">{icon}</div>
                      <div className="text-xs text-slate-400 font-semibold">{label}</div>
                      <div className="font-black text-slate-700 text-xs mt-0.5 truncate">{val}</div>
                    </div>
                  ))}
                </div>

                {rec.notes && <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-2.5 mb-3 italic line-clamp-2">"{rec.notes}"</p>}

                <div className="flex gap-1.5">
                  <button onClick={() => setSelected(selected?.id===rec.id ? null : rec)}
                    className={`flex-1 text-xs py-2 rounded-xl font-bold transition-all ${selected?.id===rec.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                    {selected?.id===rec.id ? 'Hide' : '👁 View'}
                  </button>
                  <button onClick={() => startEdit(rec)} className="text-xs bg-amber-100 text-amber-700 px-3 py-2 rounded-xl hover:bg-amber-200 transition font-bold">✏️</button>
                  <ExportMenu type="record" id={rec.id} label="" size="sm" />
                  <button onClick={() => setDeleteId(rec.id)} className="text-xs bg-red-100 text-red-600 px-3 py-2 rounded-xl hover:bg-red-200 transition font-bold">🗑</button>
                </div>

                {selected?.id===rec.id && editingId!==rec.id && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <DynamicForm formData={rec} animalData={animal||{}} onChange={()=>{}} viewOnly={true} feedRows={rec.feeding_data||[]} onFeedChange={()=>{}} />
                  </div>
                )}
                {editingId===rec.id && (
                  <div className="mt-4 border-t border-amber-100 pt-4">
                    <div className="action-row mb-3">
                      <button onClick={saveEdit} disabled={saving} className="btn-primary text-xs py-2 px-3 flex-1 justify-center">{saving?'⏳':'✅ Save'}</button>
                      <button onClick={cancelEdit} className="btn-secondary text-xs py-2 px-3 flex-1 justify-center">Cancel</button>
                    </div>
                    <DynamicForm formData={editData} animalData={animal||{}} onChange={(n,v)=>setEditData(p=>({...p,[n]:v}))} viewOnly={false} feedRows={editData.feeding_data||[]} onFeedChange={fd=>setEditData(p=>({...p,feeding_data:fd}))} />
                  </div>
                )}
              </div>
            ))}
          </div>

        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] data-table">
                <thead>
                  <tr>
                    {['#','Date','Milk','Fat%','SNF%','Rate','Expenses','Health','Pregnancy','Status','Officer','Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, i) => (
                    <React.Fragment key={rec.id}>
                      <tr>
                        <td className="text-slate-400 font-bold text-xs">{i+1}</td>
                        <td className="font-mono font-black text-slate-700 whitespace-nowrap">{rec.record_date}</td>
                        <td className="font-black text-blue-700">{rec.milk_per_day!=null?`${rec.milk_per_day}L`:'—'}</td>
                        <td>{rec.fat??'—'}</td>
                        <td>{rec.snf??'—'}</td>
                        <td>{rec.rate!=null?`₹${rec.rate}`:'—'}</td>
                        <td>{rec.expenses!=null?`₹${rec.expenses}`:'—'}</td>
                        <td><span className={rec.health_status==='Healthy'?'badge-green':rec.health_status==='Sick'?'badge-red':rec.health_status?'badge-yellow':'badge-gray'}>{rec.health_status||'—'}</span></td>
                        <td className="whitespace-nowrap text-xs">{rec.pregnancy_status||'—'}</td>
                        <td>{rec.is_draft?<span className="badge-yellow">Draft</span>:<span className="badge-green">✓</span>}</td>
                        <td className="text-xs text-slate-500 whitespace-nowrap">{rec.officer_name||'—'}</td>
                        <td>
                          <div className="flex gap-1">
                            <button onClick={()=>{setSelected(selected?.id===rec.id?null:rec);setEditingId(null)}}
                              className={`text-xs px-2 py-1.5 rounded-lg font-bold transition ${selected?.id===rec.id?'bg-blue-600 text-white':'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                              {selected?.id===rec.id?'Hide':'👁'}
                            </button>
                            <button onClick={()=>startEdit(rec)} className="text-xs bg-amber-100 text-amber-700 px-2 py-1.5 rounded-lg hover:bg-amber-200 transition font-bold">✏️</button>
                            <ExportMenu type="record" id={rec.id} label="" size="sm" />
                            <button onClick={()=>setDeleteId(rec.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-200 transition font-bold">🗑</button>
                          </div>
                        </td>
                      </tr>
                      {selected?.id===rec.id && editingId!==rec.id && (
                        <tr><td colSpan={12} className="bg-blue-50/40 px-5 py-4 border-t border-blue-100">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Record Detail — {rec.record_date}</p>
                          <DynamicForm formData={rec} animalData={animal||{}} onChange={()=>{}} viewOnly={true} feedRows={rec.feeding_data||[]} onFeedChange={()=>{}} />
                        </td></tr>
                      )}
                      {editingId===rec.id && (
                        <tr><td colSpan={12} className="bg-amber-50/40 px-5 py-4 border-t border-amber-100">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">✏️ Editing — {rec.record_date}</span>
                            <div className="action-row">
                              <button onClick={saveEdit} disabled={saving} className="btn-primary text-xs py-1.5 px-3">{saving?'⏳ Saving...':'✅ Save'}</button>
                              <button onClick={cancelEdit} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                            </div>
                          </div>
                          <DynamicForm formData={editData} animalData={animal||{}} onChange={(n,v)=>setEditData(p=>({...p,[n]:v}))} viewOnly={false} feedRows={editData.feeding_data||[]} onFeedChange={fd=>setEditData(p=>({...p,feeding_data:fd}))} />
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm pop-in">
              <div className="text-5xl text-center mb-4">🗑️</div>
              <h3 className="font-black text-slate-800 text-center text-xl mb-2">Delete this record?</h3>
              <p className="text-slate-500 text-sm text-center mb-7">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => doDelete(deleteId)} className="flex-1 btn-danger justify-center">Yes, Delete</button>
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary justify-center">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
