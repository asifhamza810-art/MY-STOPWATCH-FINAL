import { Link } from 'react-router-dom'

/**
 * Acadiv Logo System
 * - Wayfinder symbol: An upward-pointing faceted compass-geometric diamond
 *   symbolizing student trajectory, discovery, connected pathways, and progress.
 * - Precision vector geometry with dual gradients (Living Teal -> Electric Lime).
 * - Clean geometric wordmark: "ACADIV".
 * - No awkward badges or pills.
 *
 * @param {'full'|'symbol'|'wordmark'} variant
 * @param {'dark'|'light'|'auto'} surface
 * @param {'sm'|'md'|'lg'} size
 */
export default function AcadivLogo({
  variant = 'full',
  surface = 'auto',
  size = 'md',
  className = '',
  asLink = false,
  to = '/',
}) {
  const sizeMap = {
    sm: { symbolSize: 24, fontSize: '1.1rem', gap: '8px' },
    md: { symbolSize: 32, fontSize: '1.35rem', gap: '10px' },
    lg: { symbolSize: 42, fontSize: '1.75rem', gap: '14px' },
  }

  const { symbolSize, fontSize, gap } = sizeMap[size] || sizeMap.md

  const content = (
    <span
      className={`acadiv-logo acadiv-logo-${surface} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        textDecoration: 'none',
        lineHeight: 1,
      }}
    >
      {/* Wayfinder Mark */}
      {(variant === 'full' || variant === 'symbol') && (
        <svg
          width={symbolSize}
          height={symbolSize}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <defs>
            <linearGradient id="acadiv-teal-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34B9A5" />
              <stop offset="0.6" stopColor="#174B43" />
              <stop offset="1" stopColor="#0E2528" />
            </linearGradient>
            <linearGradient id="acadiv-accent-grad" x1="24" y1="6" x2="42" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C7ED69" />
              <stop offset="1" stopColor="#34B9A5" />
            </linearGradient>
            <linearGradient id="acadiv-glow-grad" x1="6" y1="24" x2="24" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34B9A5" />
              <stop offset="1" stopColor="#7568D8" />
            </linearGradient>
          </defs>

          {/* Outer Faceted Wayfinder Diamond */}
          <path
            d="M24 4L42 22L36 38L24 44L12 38L6 22L24 4Z"
            fill="url(#acadiv-teal-grad)"
            stroke="rgba(216, 226, 236, 0.25)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Connected Pathway Facets */}
          <path
            d="M24 4L42 22L24 24L24 4Z"
            fill="url(#acadiv-accent-grad)"
            fillOpacity="0.85"
          />
          <path
            d="M6 22L24 24L12 38L6 22Z"
            fill="url(#acadiv-glow-grad)"
            fillOpacity="0.75"
          />

          {/* Core Directional Waypoint Node */}
          <circle cx="24" cy="24" r="4.5" fill="#FBFAF6" />
          <circle cx="24" cy="24" r="2" fill="#174B43" />

          {/* Rising Trajectory Vector Pin */}
          <path
            d="M24 8L30 14L26 14L26 21L22 21L22 14L18 14L24 8Z"
            fill="#FBFAF6"
          />
        </svg>
      )}

      {/* Wordmark */}
      {(variant === 'full' || variant === 'wordmark') && (
        <span
          className="acadiv-wordmark"
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 800,
            fontSize,
            letterSpacing: '-0.035em',
            color: surface === 'dark' ? '#FBFAF6' : surface === 'light' ? '#172A2D' : 'currentColor',
            display: 'inline-block',
          }}
        >
          ACADIV
        </span>
      )}
    </span>
  )

  if (asLink) {
    return (
      <Link to={to} style={{ textDecoration: 'none' }} aria-label="Acadiv Home">
        {content}
      </Link>
    )
  }

  return content
}

