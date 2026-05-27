const LBS_PER_KG = 2.20462

export function convert(kg, unit) {
  return unit === 'lbs' ? kg * LBS_PER_KG : kg
}

export function unitLabel(unit) {
  return unit === 'lbs' ? 'lbs' : 'kg'
}
