import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { convert, unitLabel } from '../utils/units'

const WINDOW_S = 30

function LiveGraph({ readings, sessionMax, unit }) {
  const now = Date.now()
  const windowStart = now - WINDOW_S * 1000
  const data = []
  for (const r of readings) {
    if (r.t < windowStart) continue
    data.push({ t: +((r.t - windowStart) / 1000).toFixed(2), value: +convert(r.kg, unit).toFixed(2) })
  }

  const maxDisplay = sessionMax != null ? +convert(sessionMax, unit).toFixed(2) : null
  const ul = unitLabel(unit)

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
            domain={[0, 'auto']}
            stroke="var(--dim)"
            tick={{ fontSize: 10, fill: 'var(--muted)' }}
            tickLine={false}
            axisLine={false}
            unit={` ${ul}`}
            width={56}
          />
          {maxDisplay != null && (
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
