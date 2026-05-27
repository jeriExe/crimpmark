export default function ConnectButton({ connected, error, onConnect, onDisconnect }) {
  const supported = 'bluetooth' in navigator

  if (!supported) {
    return <span style={{ color: 'var(--red)', fontSize: 12 }}>Web Bluetooth not supported — use Chrome/Edge</span>
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {connected && (
        <span style={{ color: 'var(--green)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
          Connected
        </span>
      )}
      <button
        onClick={connected ? onDisconnect : onConnect}
        className={connected ? 'danger' : 'primary'}
      >
        {connected ? 'Disconnect' : 'Connect scale'}
      </button>
      {error && <span style={{ color: 'var(--red)', fontSize: 12 }}>{error}</span>}
    </div>
  )
}
