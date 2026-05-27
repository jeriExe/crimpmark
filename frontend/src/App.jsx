import { useState, useRef, useCallback, useEffect } from 'react'
import { useBluetooth } from './hooks/useBluetooth'
import ConnectButton from './components/ConnectButton'
import UnitToggle from './components/UnitToggle'
import LiveGraph from './components/LiveGraph'
import CaptureBar from './components/CaptureBar'
import ResultsTable from './components/ResultsTable'
import { convert, unitLabel } from './utils/units'

const STORAGE_KEY = 'crimpmark_results'
const PREFS_KEY = 'crimpmark_prefs'
const MAX_READINGS = 600  // 30s @ ~20Hz headroom

function loadResults() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [] } catch { return [] }
}
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY)) ?? {} } catch { return {} }
}

export default function App() {
  const initialPrefs = loadPrefs()
  const [unit, setUnit]       = useState(initialPrefs.unit  ?? 'kg')
  const [hand, setHand]       = useState(initialPrefs.hand  ?? 'R')
  const [skipFirst5, setSkip] = useState(initialPrefs.skip  ?? false)
  const [holdLabel, setHoldLabel] = useState('20mm')

  const [readings, setReadings] = useState([])
  const [sessionMax, setSessionMax] = useState(null)
  const [capturing, setCapturing] = useState(false)
  const [results, setResults] = useState(loadResults)
  const captureStartRef = useRef(0)
  const captureBufferRef = useRef([])

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ unit, hand, skip: skipFirst5 }))
  }, [unit, hand, skipFirst5])

  const handleReading = useCallback((kg) => {
    const t = Date.now()
    setReadings(prev => {
      const next = prev.length >= MAX_READINGS ? prev.slice(-MAX_READINGS + 1) : prev.slice()
      next.push({ t, kg })
      return next
    })
    setSessionMax(prev => (prev == null || kg > prev) ? kg : prev)
    if (capturing) captureBufferRef.current.push({ t, kg })
  }, [capturing])

  const { connected, error, connect, disconnect, sendCommand } = useBluetooth(handleReading)

  function startCapture() {
    captureBufferRef.current = []
    captureStartRef.current = Date.now()
    setCapturing(true)
  }

  function stopCapture() {
    setCapturing(false)
    const buf = captureBufferRef.current
    const start = captureStartRef.current
    const usable = skipFirst5 ? buf.filter(r => r.t - start >= 5000) : buf
    if (usable.length === 0) return
    const kgs = usable.map(r => r.kg)
    const maxKg = Math.max(...kgs)
    const avgKg = kgs.reduce((a, b) => a + b, 0) / kgs.length
    const entry = {
      id: crypto.randomUUID(),
      label: holdLabel,
      hand,
      maxKg,
      avgKg,
      skippedFirst5: skipFirst5,
      timestamp: new Date().toISOString(),
    }
    setResults(prev => {
      const next = [...prev, entry]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function deleteResult(id) {
    setResults(prev => {
      const next = prev.filter(r => r.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const currentKg = readings.length > 0 ? readings[readings.length - 1].kg : null
  const ul = unitLabel(unit)

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 28px 80px' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>crimpmark</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ConnectButton
            connected={connected}
            error={error}
            onConnect={connect}
            onDisconnect={disconnect}
          />
          <UnitToggle unit={unit} onChange={setUnit} />
        </div>
      </header>

      <div className="rule" />

      {/* Hero readout */}
      <section style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              className="num"
              style={{
                fontSize: 88,
                fontWeight: 700,
                color: connected ? 'var(--amber)' : 'var(--dim)',
                letterSpacing: '-0.04em',
                lineHeight: 0.9,
              }}
            >
              {currentKg != null ? convert(currentKg, unit).toFixed(1) : '0.0'}
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 18, fontWeight: 500 }}>{ul}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 32, paddingBottom: 6 }}>
          <Stat label="Session max" value={sessionMax} unit={unit} color="var(--red)" />
          <Stat
            label="Average"
            value={capturing && captureBufferRef.current.length
              ? captureBufferRef.current.reduce((a, b) => a + b.kg, 0) / captureBufferRef.current.length
              : null}
            unit={unit}
            color="var(--text)"
          />
        </div>
      </section>

      <div style={{ marginTop: 20 }}>
        <LiveGraph readings={readings} sessionMax={sessionMax} unit={unit} />
      </div>

      <div className="rule" />

      <CaptureBar
        capturing={capturing}
        connected={connected}
        holdLabel={holdLabel}
        onHoldChange={setHoldLabel}
        hand={hand}
        onHandChange={setHand}
        skipFirst5={skipFirst5}
        onSkipChange={setSkip}
        onStart={startCapture}
        onStop={stopCapture}
        onTare={() => sendCommand('t')}
      />

      <div className="rule" />

      <section>
        <h2 className="label" style={{ marginBottom: 12 }}>Sessions</h2>
        <ResultsTable results={results} onDelete={deleteResult} unit={unit} />
      </section>
    </div>
  )
}

function Stat({ label, value, unit, color }) {
  const ul = unitLabel(unit)
  return (
    <div>
      <div className="label" style={{ marginBottom: 4 }}>{label}</div>
      <div className="num" style={{ fontSize: 22, fontWeight: 600, color, letterSpacing: '-0.02em' }}>
        {value != null ? convert(value, unit).toFixed(1) : '—'}
        <span style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 500, marginLeft: 4 }}>{ul}</span>
      </div>
    </div>
  )
}
