import { convert, unitLabel } from '../utils/units'

export default function ResultsTable({ results, onDelete, unit }) {
  const ul = unitLabel(unit)

  if (results.length === 0) {
    return (
      <p style={{ color: '#555e80', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
        No saved results yet. Select a hold and capture a pull.
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2e3250', color: '#888' }}>
            <th style={th}>Hold</th>
            <th style={th}>Max ({ul})</th>
            <th style={th}>Avg ({ul})</th>
            <th style={th}>Date</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {[...results].reverse().map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #1e2130' }}>
              <td style={td}><strong>{r.label}</strong></td>
              <td style={{ ...td, color: '#ef5350' }}>{convert(r.maxKg, unit).toFixed(2)}</td>
              <td style={{ ...td, color: '#5c6bc0' }}>{convert(r.avgKg, unit).toFixed(2)}</td>
              <td style={{ ...td, color: '#888' }}>{new Date(r.timestamp).toLocaleString()}</td>
              <td style={td}>
                <button
                  onClick={() => onDelete(r.id)}
                  style={{ background: 'transparent', color: '#555e80', padding: '4px 8px', fontSize: 12 }}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const th = { textAlign: 'left', padding: '8px 12px', fontWeight: 500 }
const td = { padding: '10px 12px' }
