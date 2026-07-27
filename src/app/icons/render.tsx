import { ImageResponse } from "next/og"

/** Shared PWA icon renderer (app tile background + the CanetaOS mark),
 * used by /icons/192 and /icons/512 — kept out of the special icon.tsx
 * convention so the URLs are stable for manifest.ts to reference directly. */
export function renderAppIcon(size: number) {
  const padding = Math.round(size * 0.16)
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f1b2b",
        }}
      >
        <svg
          width={size - padding * 2}
          height={size - padding * 2}
          viewBox="0 0 28 28"
          fill="none"
        >
          <path
            d="M8 20C10 14 13 10 16 12C19 14 14 22 21 10"
            stroke="#faf9f6"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="21" cy="10" r="2.8" fill="#faf9f6" fillOpacity="0.35" />
          <circle cx="21" cy="10" r="1.4" fill="#faf9f6" />
        </svg>
      </div>
    ),
    { width: size, height: size }
  )
}
