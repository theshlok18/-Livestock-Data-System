import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from './Navbar'
import DynamicForm, { t } from './DynamicForm'
import ExportMenu from './ExportMenu'
import { emptyFeedRow } from './FeedingSection'

function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export default function AnimalForm() {
  const { tagNo }        = useParams()
  const [searchParams]   = useSearchParams()
  const isNew            = searchParams.get('new') === 'true'
  const navigate         = useNavigate()
  const printRef         = useRef()

  const [lang, setLang] = useState('en')

  // Form state — all fields in one flat object
  const [formData, setFormData] = useState({ tag_no: tagNo, record_date: today() })
  const [feedRows, setFeedRows] = useState([emptyFeedRow()])
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading]   = useState(!isNew)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  useEffect(() => {
    if (!isNew) fetchAnimal()
    else setLoading(false)
  }, [tagNo])

  const fetchAnimal = async () => {
    try {
      const res = await api.get(`/animal/${tagNo}`)
      if (res.data.found) {
        const a = res.data.animal
        // Merge animal fields into formData
        setFormData(p => ({
          ...p,
          animal_type: a.animal_type, breed: a.breed, age: a.age,
          owner_name: a.owner_name, village: a.village, contact: a.contact,
          mobile_no: a.mobile_no, aadhar_no: a.aadhar_no,
        }))
        if (a.image_path) setImagePreview(`/api/uploads/${a.image_path}`)
      }
    } catch { setError('Failed to load animal data.') }
    finally { setLoading(false) }
  }

  const handleChange = (name, value) => {
    setFormData(p => ({ ...p, [name]: value }))
  }

  const handleSave = async (isDraft = false) => {
    setSaving(true); setError(''); setSuccess('')
    try {
      // 1. Save animal record
      const animalFields = ['animal_type','breed','age','owner_name','village','contact','mobile_no','aadhar_no']
      const fd = new FormData()
      fd.append('tag_no', tagNo)
      animalFields.forEach(k => { if (formData[k]) fd.append(k, formData[k]) })
      if (imageFile) fd.append('image', imageFile)
      await api.post('/animal', fd, { headers: { 'Content-Type': 'multipart/form-data' } })

      // 2. Build clean feeding_data
      const feeding_data = feedRows
        .filter(r => r.feed_name)
        .map(({ id, ...rest }) => rest)

      // 3. Save monthly record
      await api.post('/record', {
        ...formData,
        tag_no: tagNo,
        is_draft: isDraft,
        feeding_data,
      })

      setSuccess(isDraft ? t('btn_draft', lang) + ' saved!' : t('btn_submit', lang) + ' ✓')
      if (!isDraft) setTimeout(() => navigate(`/history/${tagNo}`), 1200)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" className="animate-spin mx-auto mb-3">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          <p className="text-slate-500 font-semibold">Loading...</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="page-wrap page-enter">

        {/* ── Top bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5 no-print">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={isNew
                ? { background: '#e8f5e9', color: '#2d5a27', boxShadow: '0 3px 0 #c8e6c9' }
                : { background: '#e3f2fd', color: '#1565c0', boxShadow: '0 3px 0 #bbdefb' }}>
              <Icon d={isNew ? 'M12 4v16m8-8H4' : 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'} size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {isNew ? 'New Animal Registration' : 'Monthly Record Entry'}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg"
                  style={{ background: '#e8f5e9', color: '#2d5a27', border: '1px solid #c8e6c9' }}>
                  {tagNo}
                </span>
                {formData.animal_type && (
                  <span className="text-xs text-slate-400 font-medium">
                    {formData.animal_type} · {formData.breed} · {formData.owner_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="action-row flex-wrap">
            {/* Language toggle */}
            <button
              onClick={() => setLang(l => l === 'en' ? 'mr' : 'en')}
              className="btn-secondary text-xs font-bold px-3 py-2"
              style={{ minWidth: 80 }}>
              🌐 {t('lang_toggle', lang)}
            </button>
            <button onClick={() => navigate(`/history/${tagNo}`)} className="btn-secondary text-xs">
              <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" size={14} />
              {t('btn_history', lang)}
            </button>
            <ExportMenu type="animal" id={tagNo} label={t('btn_download', lang)} />
            <button onClick={() => window.print()} className="btn-secondary text-xs">
              <Icon d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" size={14} />
              {t('btn_print', lang)}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-2xl px-4 py-3.5 mb-5 text-sm flex items-start gap-2.5 no-print pop-in font-medium"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
            <Icon d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" size={16} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="opacity-50 hover:opacity-100 transition">
              <Icon d="M6 18L18 6M6 6l12 12" size={14} />
            </button>
          </div>
        )}
        {success && (
          <div className="rounded-2xl px-4 py-3.5 mb-5 text-sm flex items-center gap-2.5 no-print pop-in font-semibold"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
            <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={16} />
            {success}
          </div>
        )}

        {/* Photo strip */}
        <div className="card p-4 mb-4 no-print flex flex-col sm:flex-row items-start gap-4">
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50 flex-shrink-0"
            style={{ boxShadow: 'inset 0 2px 6px rgba(0,0,0,.05)' }}>
            {imagePreview
              ? <img src={imagePreview} alt="Animal" className="w-full h-full object-cover" />
              : <Icon d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" size={28} />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-0.5">Animal Photo <span className="text-slate-400 font-normal">(optional)</span></p>
            <p className="text-xs text-slate-400 mb-2">JPG, PNG, WEBP · Max 5MB</p>
            <div className="flex items-center gap-3">
              <label className="btn-secondary cursor-pointer text-xs py-1.5">
                <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" size={13} />
                Choose Photo
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) } }} />
              </label>
              {imagePreview && (
                <button onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="text-xs font-semibold hover:underline" style={{ color: '#c4622d' }}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Form help note */}
        <div className="card p-3 mb-4 no-print flex items-start gap-2.5" style={{ borderLeft: '4px solid #bbf7d0' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p className="text-xs text-slate-600">
            Fill in all sections below. Fields marked <span className="text-red-500 font-bold">*</span> are required.
            The <strong>Feeding Details</strong> section lets you add multiple feed items with automatic cost calculation.
            Use the <strong>🌐</strong> button to switch between English and Marathi.
          </p>
        </div>

        <div ref={printRef} className="shadow-md">
          <DynamicForm
            formData={formData}
            animalData={{}}
            onChange={handleChange}
            viewOnly={false}
            feedRows={feedRows}
            onFeedChange={setFeedRows}
            lang={lang}
          />
        </div>

        {/* Action buttons */}
        <div className="action-row mt-5 no-print">
          <button onClick={() => handleSave(false)} disabled={saving} className="btn-primary flex-1 sm:flex-none justify-center py-3">
            {saving
              ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-spin"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> Saving...</>
              : <><Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" size={15} /> {t('btn_submit', lang)}</>
            }
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn-amber flex-1 sm:flex-none justify-center py-3">
            <Icon d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" size={15} />
            {t('btn_draft', lang)}
          </button>
          <button onClick={() => navigate(-1)} className="btn-secondary flex-1 sm:flex-none justify-center">
            {t('btn_cancel', lang)}
          </button>
        </div>
      </div>
    </div>
  )
}

function today() { return new Date().toISOString().split('T')[0] }
