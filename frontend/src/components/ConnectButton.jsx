export default function ConnectButton({ connected, error, onConnect, onDisconnect }) {
  const supported = 'bluetooth' in navigator

  if (!supported) {
    return <span style={{ color: 'var(--red)', fontSize: 12 }}>Web Bluetooth not supported — use Chrome/Edge</span>
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        onClick={connected ? onDisconnect : onConnect}
        className={connected ? 'danger' : 'primary'}
      >
        {connected ? 'Disconnect' : 'Connect'}
      </button>
      {error && <span style={{ color: 'var(--red)', fontSize: 12 }}>{error}</span>}
    </div>
  )
}
