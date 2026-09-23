export function BalloonIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.25c-3.55 0-6.25 2.76-6.25 6.44 0 3.25 1.82 5.38 4.45 6.2l-.75 2.42h5.1l-.75-2.42c2.63-.82 4.45-2.95 4.45-6.2 0-3.68-2.7-6.44-6.25-6.44Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 18.31v2.44m-2.05 0h4.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
