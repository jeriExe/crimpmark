export default function UnitToggle({ unit, onChange }) {
  return (
    <div className="segment">
      <button className={unit === 'kg'  ? 'active' : ''} onClick={() => onChange('kg')}>KG</button>
      <button className={unit === 'lbs' ? 'active' : ''} onClick={() => onChange('lbs')}>LB</button>
    </div>
  )
}
