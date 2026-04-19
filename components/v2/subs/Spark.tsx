/**
 * Tiny 90x28 sparkline for numeric time-series.
 *
 * Ported from Remix `phase3c.jsx:106`. For Wave A the caller may pass stub
 * data — real CSLB risk-score history will wire in Wave B.
 */
type SparkProps = {
  data: number[]
  stroke?: string
  width?: number
  height?: number
}

export function Spark({
  data,
  stroke = "var(--ink)",
  width = 90,
  height = 28,
}: SparkProps) {
  if (!data || data.length === 0) {
    return <svg width={width} height={height} aria-hidden />
  }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / Math.max(1, data.length - 1)
  const points = data
    .map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / range) * height
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
