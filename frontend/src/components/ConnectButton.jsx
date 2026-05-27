export default function ConnectButton({ connType, onConnTypeChange, connected, error, onConnect, onDisconnect }) {
  const serialOk    = 'serial' in navigator
  const bluetoothOk = 'bluetooth' in navigator

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {/* Serial / BT toggle */}
      <div style={{ display: 'flex', background: '#12141f', borderRadius: 6, padding: 2 }}>
        {[['serial', 'Serial'], ['bluetooth', 'Bluetooth']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => !connected && onConnTypeChange(val)}
            disabled={connected}
            style={{
              background: connType === val ? '#2e3250' : 'transparent',
              color: connType === val ? '#e8eaf0' : '#666',
              padding: '5px 12px',
              fontSize: 13,
              fontWeight: connType === val ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {connType === 'serial' && !serialOk ? (
        <span style={{ color: '#ef5350', fontSize: 13 }}>Serial not supported — use Chrome/Edge</span>
      ) : connType === 'bluetooth' && !bluetoothOk ? (
        <span style={{ color: '#ef5350', fontSize: 13 }}>Bluetooth not supported — use Chrome/Edge</span>
      ) : (
        <button
          onClick={connected ? onDisconnect : onConnect}
          style={{ background: connected ? '#c62828' : '#2e7d32' }}
        >
          {connected ? 'Disconnect' : `Connect (${connType === 'serial' ? 'USB' : 'BLE'})`}
        </button>
      )}

      {connected && <span style={{ color: '#66bb6a', fontSize: 13 }}>● Connected</span>}
      {error     && <span style={{ color: '#ef5350', fontSize: 13 }}>{error}</span>}
    </div>
  )
}
