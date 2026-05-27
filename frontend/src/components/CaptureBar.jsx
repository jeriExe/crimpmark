import { convert, unitLabel } from '../utils/units'
import HoldSelector from './HoldSelector'

export default function CaptureBar({
  capturing, connected, holdLabel, onHoldChange,
  captureMax, captureAvg, onStart, onStop, onTare, unit,
}) {
  const ul = unitLabel(unit)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: '#1e2130', borderRadius: 8, padding: '12px 16px',
      flexWrap: 'wrap',
    }}>
      <HoldSelector value={holdLabel} onChange={onHoldChange} />

      {!capturing ? (
        <button
          onClick={onStart}
          disabled={!connected || !holdLabel}
          style={{ background: '#1565c0' }}
        >
          Start Capture
        </button>
      ) : (
        <button onClick={onStop} style={{ background: '#c62828' }}>
          Stop &amp; Save
        </button>
      )}

      <button
        onClick={onTare}
        disabled={!connected}
        style={{ background: '#37474f' }}
      >
        Tare
      </button>

      {capturing && (
        <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
          <span>
            <span style={{ color: '#888' }}>Max </span>
            <strong style={{ color: '#ef5350' }}>
              {captureMax != null ? `${convert(captureMax, unit).toFixed(2)} ${ul}` : '—'}
            </strong>
          </span>
          <span>
            <span style={{ color: '#888' }}>Avg </span>
            <strong style={{ color: '#5c6bc0' }}>
              {captureAvg != null ? `${convert(captureAvg, unit).toFixed(2)} ${ul}` : '—'}
            </strong>
          </span>
        </div>
      )}
    </div>
  )
}
