import React from 'react'
import formSchema from '../config/formSchema.json'
import T from '../config/translations.json'
import FeedingSection from './FeedingSection'

// ── Translation helper ────────────────────────────────────────────────────────
export const t = (key, lang = 'en') => T[key]?.[lang] || T[key]?.en || key

const SECTION_ICONS = {
  basic_info:       '📋',
  animal_details:   '🐄',
  reproduction:     '🔄',
  milk_production:  '🥛',
  feeding_details:  '🌾',
  performance:      '📈',
  health_breeding:  '🏥',
  calf_details:     '🐮',
  body_measurements:'⚖',
  remarks:          '📝',
}

const SECTION_HELP = {
  basic_info:       'Owner and identification details',
  animal_details:   'Breed, age, and physical details',
  reproduction:     'Pregnancy and calving information',
  milk_production:  'Daily milk yield and quality data',
  feeding_details:  'Feed items given today — add multiple rows',
  performance:      'Milk trend and challenge feeding',
  health_breeding:  'Health status and vaccination records',
  calf_details:     'Details of the calf if recently calved',
  body_measurements:'Weight and body condition',
  remarks:          'Any additional observations',
}

// ── Field input renderer ──────────────────────────────────────────────────────
function FieldInput({ field, value, onChange, viewOnly, lang, formValues }) {
  const base = 'w-full bg-transparent text-sm px-2 py-1 outline-none focus:bg-yellow-50 rounded transition'

  // Conditional field — hide if condition not met
  if (field.conditional) {
    const [condField, condVal] = field.conditional.split('=')
    const actual = (formValues[condField] || '').toLowerCase()
    if (actual !== condVal.toLowerCase()) {
      return <span className="text-xs text-slate-300 italic px-2">{t('select', lang)}</span>
    }
  }

  if (field.readonly || viewOnly) {
    return (
      <span className={`block text-sm px-2 py-1 ${
        field.name === 'tag_no' ? 'font-mono font-bold text-green-800' : 'text-slate-700'
      }`}>
        {value || <span className="text-slate-300 italic text-xs">—</span>}
      </span>
    )
  }

  if (field.type === 'yesno') {
    return (
      <select value={value ?? ''} onChange={e => onChange(field.name, e.target.value)} className={base}>
        <option value="">{t('select', lang)}</option>
        <option value="yes">{t('yes', lang)}</option>
        <option value="no">{t('no', lang)}</option>
      </select>
    )
  }

  if (field.type === 'dropdown') {
    const opts = field.options_keys || []
    return (
      <select value={value ?? ''} onChange={e => onChange(field.name, e.target.value)}
        required={field.required} className={base}>
        <option value="">{t('select', lang)}</option>
        {opts.map(o => (
          <option key={o} value={T[o]?.en || o}>
            {t(o, lang)}
          </option>
        ))}
      </select>
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea value={value ?? ''} onChange={e => onChange(field.name, e.target.value)}
        required={field.required} rows={3} className={`${base} resize-none`} />
    )
  }

  if (field.type === 'date') {
    return (
      <input type="date" value={value ?? ''} onChange={e => onChange(field.name, e.target.value)}
        required={field.required} className={base} />
    )
  }

  return (
    <input
      type={field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
      value={value ?? ''}
      onChange={e => onChange(field.name, e.target.value)}
      required={field.required}
      step={field.step}
      min={field.min}
      max={field.max}
      className={base}
    />
  )
}

// ── Main DynamicForm ──────────────────────────────────────────────────────────
export default function DynamicForm({
  formData = {},
  animalData = {},
  onChange = () => {},
  viewOnly = false,
  feedRows = [],
  onFeedChange = () => {},
  lang = 'en',
}) {
  const merged = { ...animalData, ...formData }

  return (
    <div className="print-area border-2 border-slate-300 bg-white rounded-xl overflow-hidden">

      {/* Title bar */}
      <div className="text-white text-center py-3 px-4"
        style={{ background: 'linear-gradient(135deg,#2d5a27,#1e4a1a)' }}>
        <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest">
          {t('form_title', lang)}
        </h2>
        <p className="text-green-200/70 text-xs mt-0.5 hidden sm:block">
          {t('dept_subtitle', lang)}
        </p>
      </div>

      {formSchema.sections.map(section => {
        const isFeeding = section.type === 'feeding'
        const fields    = section.fields || []
        const rows      = isFeeding ? [] : chunkFields(fields, section)

        return (
          <div key={section.id} className="border-b border-slate-200 last:border-b-0">
            {/* Section header */}
            <div className="text-white text-xs font-bold px-3 py-2 uppercase tracking-widest flex items-center justify-between"
              style={{ background: section.color }}>
              <div className="flex items-center gap-2">
                <span>{SECTION_ICONS[section.id] || '📋'}</span>
                {t(section.title_key, lang)}
              </div>
              {SECTION_HELP[section.id] && (
                <span className="text-white/60 text-xs font-normal normal-case tracking-normal hidden sm:block">
                  {SECTION_HELP[section.id]}
                </span>
              )}
            </div>

            <table className="form-table">
              <tbody>
                {isFeeding ? (
                  <FeedingSection
                    rows={feedRows}
                    onChange={onFeedChange}
                    viewOnly={viewOnly}
                    lang={lang}
                  />
                ) : (
                  rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map(field => (
                        <React.Fragment key={field.name}>
                          <td className="form-label-cell">
                            {t(field.key, lang)}
                            {field.required && !viewOnly && <span className="text-red-400 ml-0.5">*</span>}
                          </td>
                          <td className={`form-value-cell ${field.wide ? 'wide' : ''}`}>
                            <FieldInput
                              field={field}
                              value={merged[field.name]}
                              onChange={onChange}
                              viewOnly={viewOnly}
                              lang={lang}
                              formValues={merged}
                            />
                          </td>
                        </React.Fragment>
                      ))}
                      {/* Pad odd rows */}
                      {row.length === 1 && !row[0].wide && (
                        <>
                          <td className="form-label-cell" />
                          <td className="form-value-cell" />
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )
      })}

    </div>
  )
}

// ── Chunk fields into 2-column rows (wide fields get full row) ────────────────
function chunkFields(fields, section) {
  const rows = []
  let i = 0
  while (i < fields.length) {
    const f = fields[i]
    if (f.wide) {
      rows.push([f])
      i++
    } else if (i + 1 < fields.length && !fields[i + 1].wide) {
      rows.push([f, fields[i + 1]])
      i += 2
    } else {
      rows.push([f])
      i++
    }
  }
  return rows
}
