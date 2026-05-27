import { useState, useRef, useCallback } from 'react'
import { useSerial } from './hooks/useSerial'
import { useBluetooth } from './hooks/useBluetooth'
import ConnectButton from './components/ConnectButton'
import LiveGraph from './components/LiveGraph'
import CaptureBar from './components/CaptureBar'
import ResultsTable from './components/ResultsTable'
import { convert, unitLabel } from './utils/units'

const STORAGE_KEY = 'crimpmark_results'
const MAX_READINGS = 1800

function loadResults() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [] } catch { return [] }
}

export default function App() {
  const [unit, setUnit] = useState('kg')
  const [connType, setConnType] = useState('serial')
  const [readings, setReadings] = useState([])
  const [sessionMax, setSessionMax] = useState(null)
  const [capturing, setCapturing] = useState(false)
  const [holdLabel, setHoldLabel] = useState('20mm')
  const [results, setResults] = useState(loadResults)
  const captureBufferRef = useRef([])

  const handleReading = useCallback((kg) => {
    const entry = { t: Date.now(), kg }
    setReadings(prev => {
      const next = [...prev, entry]
      return next.length > MAX_READINGS ? next.slice(-MAX_READINGS) : next
    })
    setSessionMax(prev => (prev == null || kg > prev) ? kg : prev)
    if (capturing) captureBufferRef.current.push(kg)
  }, [capturing])

  const serial    = useSerial(handleReading)
  const bluetooth = useBluetooth(handleReading)
  const conn = connType === 'serial' ? serial : bluetooth

  function startCapture() {
    captureBufferRef.current = []
    setCapturing(true)
  }

  function stopCapture() {
    setCapturing(false)
    const buf = captureBufferRef.current
    if (buf.length === 0) return
    const maxKg = Math.max(...buf)
    const avgKg = buf.reduce((a, b) => a + b, 0) / buf.length
    const entry = {
      id: crypto.randomUUID(),
      label: holdLabel,
      maxKg,
      avgKg,
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

  const captureMax = capturing && captureBufferRef.current.length > 0
    ? Math.max(...captureBufferRef.current) : null
  const captureAvg = capturing && captureBufferRef.current.length > 0
    ? captureBufferRef.current.reduce((a, b) => a + b, 0) / captureBufferRef.current.length : null

  const currentKg = readings[readings.length - 1]?.kg ?? null
  const ul = unitLabel(unit)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>Crimpmark</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ConnectButton
            connType={connType}
            onConnTypeChange={setConnType}
            connected={conn.connected}
            error={conn.error}
            onConnect={conn.connect}
            onDisconnect={conn.disconnect}
          />
          <button
            onClick={() => setUnit(u => u === 'kg' ? 'lbs' : 'kg')}
            style={{ background: '#2e3250', minWidth: 52 }}
          >
            {ul}
          </button>
        </div>
      </div>

      {/* Live readout */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <Stat label="Current"     value={currentKg  != null ? `${convert(currentKg, unit).toFixed(2)} ${ul}`  : '—'} color="#e8eaf0" />
        <Stat label="Session max" value={sessionMax != null ? `${convert(sessionMax, unit).toFixed(2)} ${ul}` : '—'} color="#ef5350" />
      </div>

      {/* Graph */}
      <div style={{ background: '#1a1d2e', borderRadius: 8, padding: '12px 4px 4px', marginBottom: 16 }}>
        <LiveGraph readings={readings} sessionMax={sessionMax} unit={unit} />
      </div>

      {/* Capture + tare */}
      <div style={{ marginBottom: 24 }}>
        <CaptureBar
          capturing={capturing}
          connected={conn.connected}
          holdLabel={holdLabel}
          onHoldChange={setHoldLabel}
          captureMax={captureMax}
          captureAvg={captureAvg}
          onStart={startCapture}
          onStop={stopCapture}
          onTare={() => conn.sendCommand('t')}
          unit={unit}
        />
      </div>

      {/* Results */}
      <div style={{ background: '#1a1d2e', borderRadius: 8, padding: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Saved Results
        </h2>
        <ResultsTable results={results} onDelete={deleteResult} unit={unit} />
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: '#1e2130', borderRadius: 8, padding: '12px 20px', flex: 1 }}>
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  )
}
