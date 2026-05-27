import { convert, unitLabel } from '../utils/units'

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)     return `${Math.floor(diff)}s ago`
  if (diff < 3600)   return `${Math.floor(diff/60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export default function ResultsTable({ results, onDelete, unit }) {
  const ul = unitLabel(unit)

  if (results.length === 0) {
    return (
      <p style={{ color: 'var(--muted)', fontSize: 13, padding: '8px 0' }}>
        No sessions yet. Select a hold and capture a pull.
      </p>
    )
  }

  return (
    <table>
      <thead>
        <tr>
          <th style={{ width: '15%' }}>Hold</th>
          <th style={{ width: '10%' }}>Hand</th>
          <th style={{ width: '20%' }}>Max</th>
          <th style={{ width: '20%' }}>Avg</th>
          <th style={{ width: '25%' }}>When</th>
          <th style={{ width: '10%' }}></th>
        </tr>
      </thead>
      <tbody>
        {[...results].reverse().map(r => (
          <tr key={r.id}>
            <td style={{ fontWeight: 600 }}>{r.label}</td>
            <td style={{ color: 'var(--muted)' }}>{r.hand || '—'}</td>
            <td className="num" style={{ color: 'var(--red)', fontWeight: 600 }}>
              {convert(r.maxKg, unit).toFixed(1)} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11 }}>{ul}</span>
            </td>
            <td className="num" style={{ color: 'var(--text)' }}>
              {convert(r.avgKg, unit).toFixed(1)} <span style={{ color: 'var(--muted)', fontSize: 11 }}>{ul}</span>
            </td>
            <td style={{ color: 'var(--muted)' }}>{timeAgo(r.timestamp)}</td>
            <td style={{ textAlign: 'right' }}>
              <button
                onClick={() => onDelete(r.id)}
                style={{ padding: '4px 8px', fontSize: 12, color: 'var(--muted)', border: 'none' }}
              >
                ✕
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
