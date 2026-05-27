import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { convert, unitLabel } from '../utils/units'

const WINDOW_S = 30
const NICE_STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500]
const TARGET_TICKS = 6

/** Generate "nice" y-axis ticks. Smallest step is 0.1, axis rounded up to a tick boundary. */
function niceTicks(rawMax) {
  const step = NICE_STEPS.find(s => rawMax / s <= TARGET_TICKS) ?? NICE_STEPS[NICE_STEPS.length - 1]
  const top = Math.ceil(rawMax / step) * step
  const ticks = []
  for (let v = 0; v <= top + step * 0.001; v += step) {
    ticks.push(+v.toFixed(2))
  }
  return { ticks, top }
}

function LiveGraph({ readings, sessionMax, unit }) {
  const now = Date.now()
  const windowStart = now - WINDOW_S * 1000
  const data = []
  let dataMax = 0
  for (const r of readings) {
    if (r.t < windowStart) continue
    const value = +convert(r.kg, unit).toFixed(2)
    if (value > dataMax) dataMax = value
    data.push({ t: +((r.t - windowStart) / 1000).toFixed(2), value })
  }

  const maxDisplay = sessionMax != null ? +convert(sessionMax, unit).toFixed(2) : null
  const ul = unitLabel(unit)

  // Initial axis spans 0 to 1 kg (in current unit). Grows to fit data / session max.
  const floor = convert(1, unit)
  const rawMax = Math.max(floor, dataMax, maxDisplay ?? 0)
  const { ticks: yTicks, top: yTop } = niceTicks(rawMax)

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--rule)" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            domain={[0, WINDOW_S]}
            ticks={[0, 5, 10, 15, 20, 25, 30]}
            tickFormatter={v => `${v}s`}
            stroke="var(--dim)"
            tick={{ fontSize: 10, fill: 'var(--muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--rule)' }}
          />
          <YAxis
            domain={[0, yTop]}
            ticks={yTicks}
            stroke="var(--dim)"
            tick={{ fontSize: 10, fill: 'var(--muted)' }}
            tickLine={false}
            axisLine={false}
            unit={` ${ul}`}
            width={56}
          />
          {maxDisplay != null && maxDisplay > 0 && (
            <ReferenceLine
              y={maxDisplay}
              stroke="var(--red)"
              strokeDasharray="3 3"
              strokeOpacity={0.7}
              label={{ value: `max ${maxDisplay}`, fill: 'var(--red)', fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--amber)"
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LiveGraph
