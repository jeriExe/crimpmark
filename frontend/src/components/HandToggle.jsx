export default function HandToggle({ hand, onChange }) {
  return (
    <div className="segment">
      <button className={hand === 'L' ? 'active' : ''} onClick={() => onChange('L')} title="Left hand">L</button>
      <button className={hand === 'R' ? 'active' : ''} onClick={() => onChange('R')} title="Right hand">R</button>
    </div>
  )
}
