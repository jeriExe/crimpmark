import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts'
import { convert, unitLabel } from '../utils/units'

const WINDOW_S = 30

export default function LiveGraph({ readings, sessionMax, unit }) {
  const now = Date.now()
  const windowStart = now - WINDOW_S * 1000
  const visible = readings.filter(r => r.t >= windowStart)

  const data = visible.map(r => ({
    t: ((r.t - windowStart) / 1000).toFixed(1),
    value: +convert(r.kg, unit).toFixed(2),
  }))

  const maxDisplay = sessionMax != null ? +convert(sessionMax, unit).toFixed(2) : null
  const ul = unitLabel(unit)

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2e3250" />
          <XAxis
            dataKey="t"
            type="number"
            domain={[0, WINDOW_S]}
            tickCount={7}
            tickFormatter={v => `${v}s`}
            stroke="#555e80"
            tick={{ fontSize: 11, fill: '#888' }}
          />
          <YAxis
            domain={[0, 'auto']}
            tickFormatter={v => `${v}`}
            stroke="#555e80"
            tick={{ fontSize: 11, fill: '#888' }}
            unit={` ${ul}`}
            width={60}
          />
          <Tooltip
            contentStyle={{ background: '#1e2130', border: '1px solid #2e3250', borderRadius: 6 }}
            labelFormatter={v => `${v}s`}
            formatter={v => [`${v} ${ul}`, 'Force']}
          />
          {maxDisplay != null && (
            <ReferenceLine
              y={maxDisplay}
              stroke="#ef5350"
              strokeDasharray="4 2"
              label={{ value: `Max ${maxDisplay} ${ul}`, fill: '#ef5350', fontSize: 11, position: 'insideTopRight' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#5c6bc0"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name="Force"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
