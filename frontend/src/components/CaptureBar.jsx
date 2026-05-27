import HoldSelector from './HoldSelector'
import HandToggle from './HandToggle'

export default function CaptureBar({
  capturing, connected,
  holdLabel, onHoldChange,
  hand, onHandChange,
  skipFirst5, onSkipChange,
  onStart, onStop, onTare,
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24,
      flexWrap: 'wrap', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <Field label="Edge">
          <HoldSelector value={holdLabel} onChange={onHoldChange} />
        </Field>
        <Field label="Hand">
          <HandToggle hand={hand} onChange={onHandChange} />
        </Field>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, color: 'var(--muted)', cursor: 'pointer', userSelect: 'none',
        }}>
          <input
            type="checkbox"
            checked={skipFirst5}
            onChange={e => onSkipChange(e.target.checked)}
            style={{ accentColor: 'var(--amber)', width: 14, height: 14, cursor: 'pointer' }}
          />
          skip first 5s
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onTare} disabled={!connected}>Tare</button>
        {!capturing ? (
          <button
            onClick={onStart}
            disabled={!connected || !holdLabel}
            className="primary"
          >
            Start capture
          </button>
        ) : (
          <button onClick={onStop} className="danger">
            Stop &amp; save
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="label">{label}</span>
      {children}
    </div>
  )
}
