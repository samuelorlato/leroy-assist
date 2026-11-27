/* Ícones de interface (SVG inline, estilo traço). */

const PATHS = {
  logo: (
    <>
      <path d="M3.5 11.2 12 4l8.5 7.2" />
      <path d="M6 9.6V20h12V9.6" />
      <path d="m12 10.8.95 2.25 2.25.95-2.25.95L12 17.2l-.95-2.25-2.25-.95 2.25-.95z" fill="currentColor" stroke="none" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2.5" width="6" height="11.5" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21" />
      <path d="M8.5 21h7" />
    </>
  ),
  send: (
    <>
      <path d="m21.5 2.5-7 19-4-8.5-8-4z" />
      <path d="M21.5 2.5 10.5 13" />
    </>
  ),
  refresh: (
    <>
      <path d="M3.5 12a8.5 8.5 0 0 1 14.6-5.9L20.5 8.5" />
      <path d="M20.5 3.5v5h-5" />
      <path d="M20.5 12a8.5 8.5 0 0 1-14.6 5.9L3.5 15.5" />
      <path d="M3.5 20.5v-5h5" />
    </>
  ),
  headset: (
    <>
      <path d="M3.5 14v-2a8.5 8.5 0 0 1 17 0v2" />
      <path d="M3.5 14.5A1.5 1.5 0 0 1 5 13h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1.5 1.5 0 0 1-1.5-1.5z" />
      <path d="M20.5 14.5A1.5 1.5 0 0 0 19 13h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a1.5 1.5 0 0 0 1.5-1.5z" />
      <path d="M20.5 17.5v.5a3 3 0 0 1-3 3H13" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrowLeft: (
    <>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  sparkle: (
    <>
      <path d="M11 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5z" />
      <path d="M18.5 15.5v4M16.5 17.5h4" />
    </>
  ),
  box: (
    <>
      <path d="M20.5 7.5 12 3.2 3.5 7.5v9L12 20.8l8.5-4.3z" />
      <path d="m3.5 7.5 8.5 4.3 8.5-4.3" />
      <path d="M12 11.8v9" />
    </>
  ),
  map: (
    <>
      <path d="M9 4 3.5 6.3v13.5L9 17.5l6 2.5 5.5-2.3V4.2L15 6.5z" />
      <path d="M9 4v13.5" />
      <path d="M15 6.5V20" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="currentColor" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.6h.01" />
    </>
  ),
  chat: <path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 19.8l1.2-4.1A8 8 0 1 1 20 11.5z" />,
};

export default function Icon({ name, className = '' }) {
  return (
    <svg
      className={`ic ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
