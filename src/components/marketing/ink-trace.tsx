/** The page's one signature element: an abstract hand-drawn ink stroke,
 * echoing the pen in "CanetaOS" and the idea of tracing your own line
 * over time. Deliberately NOT a data chart — an ambiguous downward or
 * upward curve here could read as an implied weight-loss result, which
 * the product may never promise. Draws itself in once on load. */
export function InkTrace({ className = "", color = "var(--color-trace-500)" }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 800 120"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M4 84C60 84 90 40 150 40C210 40 220 92 280 92C340 92 360 26 420 26C470 26 490 66 540 66C590 66 610 48 660 48C700 48 720 60 796 60"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        className="ink-trace-path"
      />
      <circle cx="796" cy="60" r="5" fill={color} className="ink-trace-dot" />
    </svg>
  )
}
