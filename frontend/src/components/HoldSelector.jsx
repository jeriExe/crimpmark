import { useState } from 'react'

const PRESETS = ['20mm', '18mm', '15mm', '12mm', '10mm', '8mm']

export default function HoldSelector({ value, onChange }) {
  const [custom, setCustom] = useState(false)

  function handleSelect(e) {
    if (e.target.value === '__custom__') {
      setCustom(true)
      onChange('')
    } else {
      setCustom(false)
      onChange(e.target.value)
    }
  }

  if (custom) {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="e.g. pinch, sloper..."
          value={value}
          onChange={e => onChange(e.target.value)}
          autoFocus
          style={{ width: 180 }}
        />
        <button
          onClick={() => { setCustom(false); onChange(PRESETS[0]) }}
          style={{ background: '#2e3250', padding: '8px 10px' }}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <select value={value || PRESETS[0]} onChange={handleSelect} style={{ width: 140 }}>
      {PRESETS.map(p => (
        <option key={p} value={p}>{p}</option>
      ))}
      <option value="__custom__">Custom…</option>
    </select>
  )
}
