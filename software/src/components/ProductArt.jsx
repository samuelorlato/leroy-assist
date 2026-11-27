/* Ilustrações dos produtos em SVG (viewBox 64x64), sem depender de imagens externas. */

const INK = '#26302B';
const SAND_DOTS = [[21, 15], [28, 14], [36, 16], [43, 14], [24, 21], [32, 22], [40, 21], [20, 28], [28, 29], [36, 28], [44, 29], [23, 35], [31, 36], [39, 35], [45, 38], [20, 42], [28, 43], [36, 44], [43, 46], [24, 50], [32, 51], [40, 51]];
const BUCKET_BODY = 'M13 17h38l-3.2 37.5a4 4 0 0 1-4 3.5H20.2a4 4 0 0 1-4-3.5Z';
const stroke = { stroke: INK, strokeWidth: 2.2 };

const ART = {
  bucket: (c) => (
    <>
      <path d="M16 15C18 3.5 46 3.5 48 15" fill="none" stroke="#5B6761" strokeWidth="2.6" strokeLinecap="round" />
      <path d={BUCKET_BODY} fill="#fff" />
      <path d="M13.94 28h36.12l-1.45 17H15.39Z" fill={c} />
      <path d="M22 34.5h20M25.5 39.5h13" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".9" />
      <path d={BUCKET_BODY} fill="none" {...stroke} strokeLinejoin="round" />
      <rect x="10.5" y="12.5" width="43" height="6.5" rx="3.25" fill="#E3E9E0" {...stroke} />
    </>
  ),
  can: (c) => (
    <>
      <path d="M22 13V9.5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2V13" fill="none" stroke="#5B6761" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="14" y="12" width="36" height="46" rx="4" fill="#fff" />
      <path d="M14 19.5V16a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v3.5Z" fill="#E3E9E0" />
      <rect x="14" y="27" width="36" height="19" fill={c} />
      <path d="M21.5 33.5h21M25 38.5h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".9" />
      <rect x="14" y="12" width="36" height="46" rx="4" fill="none" {...stroke} />
      <path d="M14 19.5h36" {...stroke} />
    </>
  ),
  sandpaper: () => (
    <g transform="rotate(-9 32 33)">
      <rect x="15" y="9" width="34" height="47" rx="3" fill="#E6CF9E" {...stroke} />
      <g fill="#B08A4E">
        {SAND_DOTS.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.25" />)}
      </g>
    </g>
  ),
  roller: (c) => (
    <>
      <path d="M48 20h4.5a1.5 1.5 0 0 1 1.5 1.5V30a1.5 1.5 0 0 1-1.5 1.5H33v8" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="12" width="40" height="16" rx="6" fill={c} {...stroke} />
      <path d="M16 16.5v7M22 16.5v7M28 16.5v7M34 16.5v7M40 16.5v7" stroke="#D5C9AE" strokeWidth="2" strokeLinecap="round" />
      <rect x="28.5" y="39" width="9" height="20" rx="4.5" fill="#2F7D1B" {...stroke} />
    </>
  ),
  brush: () => (
    <>
      <rect x="27" y="4.5" width="10" height="24" rx="5" fill="#C98B4F" {...stroke} />
      <circle cx="32" cy="10" r="1.7" fill={INK} />
      <rect x="19" y="28" width="26" height="9" rx="2" fill="#CBD3CE" {...stroke} />
      <path d="M20 37h24v15a5 5 0 0 1-5 5H25a5 5 0 0 1-5-5Z" fill="#3B4540" {...stroke} strokeLinejoin="round" />
      <path d="M26 41.5v11M32 41.5v11M38 41.5v11" stroke="#7A8580" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  tape: () => (
    <>
      <path d="M41.5 32H51v24h-9.5Z" fill="#EBCF86" {...stroke} strokeLinejoin="round" />
      <circle cx="31" cy="32" r="20" fill="#EBCF86" {...stroke} />
      <circle cx="31" cy="32" r="14" fill="none" stroke="#D2B062" strokeWidth="1.6" />
      <circle cx="31" cy="32" r="8.5" fill="#fff" {...stroke} />
    </>
  ),
  tray: (c) => (
    <g transform="translate(0 -3)">
      <path d="M6 22h52l-6.5 24.3a3 3 0 0 1-2.9 2.2H15.4a3 3 0 0 1-2.9-2.2Z" fill="#DDE4DF" {...stroke} strokeLinejoin="round" />
      <path d="M11.5 26.5H31l-2.6 17H15.6Z" fill={c} />
      <path d="M37 28l-2.4 13M43 28l-2.4 13M49 28l-2.4 13" stroke="#9AA59F" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 22h56" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    </g>
  ),
};

export default function ProductArt({ product, size = 'sm' }) {
  const draw = ART[product.art] || ART.can;
  return (
    <span className={`art art-${size}`} style={{ '--tile': `var(--cat-${product.categoryId})` }} aria-hidden="true">
      <svg viewBox="0 0 64 64" focusable="false">{draw(product.swatch || '#9AA59F')}</svg>
    </span>
  );
}
