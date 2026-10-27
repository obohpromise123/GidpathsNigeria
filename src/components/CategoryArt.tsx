import type { ReactNode } from 'react'

// Small illustrations for each career area, drawn in the brand palette.
// Inline SVG: a few KB in total, no image requests, crisp at any size.
// They are decorative (the area name sits beside them), so screen readers skip them.

const C = {
  navy: '#0f1f3d',
  navy2: '#213a6e',
  navy3: '#3a5ea8',
  navyLight: '#b4c7ea',
  teal: '#168f75',
  tealMid: '#2fa98d',
  tealLight: '#5ec4aa',
  tealPale: '#c9eee4',
  tealDark: '#0d5d4d',
  sun: '#f2b53d',
  sunDeep: '#e09a1a',
  sunPale: '#fdf1d6',
  coral: '#ef6f6c',
  white: '#ffffff',
  sand: '#ebe5d8',
}

const ground = <rect x="14" y="114" width="212" height="3" rx="1.5" fill={C.tealPale} />

const SCENES: Record<string, ReactNode> = {
  technology: (
    <>
      {/* laptop with code */}
      <rect x="58" y="34" width="100" height="66" rx="7" fill={C.navy} />
      <rect x="64" y="40" width="88" height="54" rx="3" fill={C.navy2} />
      <rect x="71" y="48" width="30" height="4" rx="2" fill={C.tealLight} />
      <rect x="71" y="57" width="48" height="4" rx="2" fill={C.white} opacity=".85" />
      <rect x="78" y="66" width="36" height="4" rx="2" fill={C.sun} />
      <rect x="78" y="75" width="24" height="4" rx="2" fill={C.white} opacity=".6" />
      <rect x="71" y="84" width="42" height="4" rx="2" fill={C.tealLight} />
      <path d="M46 100 H170 L162 112 H54 Z" fill={C.navy2} />
      <rect x="94" y="101" width="28" height="3" rx="1.5" fill={C.navyLight} />
      {/* chart card */}
      <rect x="170" y="26" width="52" height="46" rx="7" fill={C.white} stroke={C.tealPale} strokeWidth="2" />
      <polyline points="178,60 188,50 198,54 212,38" fill="none" stroke={C.teal} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="212" cy="38" r="4" fill={C.sun} />
      <rect x="180" y="86" width="9" height="26" rx="2" fill={C.teal} />
      <rect x="193" y="78" width="9" height="34" rx="2" fill={C.sun} />
      <rect x="206" y="92" width="9" height="20" rx="2" fill={C.navy3} />
      {ground}
    </>
  ),
  health: (
    <>
      {/* first-aid card */}
      <rect x="28" y="40" width="44" height="44" rx="10" fill={C.white} stroke={C.tealPale} strokeWidth="2" />
      <rect x="45" y="49" width="10" height="26" rx="2" fill={C.teal} />
      <rect x="37" y="57" width="26" height="10" rx="2" fill={C.teal} />
      {/* heart with pulse */}
      <path
        d="M120 106 C96 90 84 76 84 61 C84 49 93 40 104 40 C112 40 117 45 120 50 C123 45 128 40 136 40 C147 40 156 49 156 61 C156 76 144 90 120 106 Z"
        fill={C.coral}
      />
      <path d="M88 68 H102 L108 56 L116 80 L123 62 L128 70 H152" fill="none" stroke={C.white} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {/* stethoscope */}
      <path d="M174 30 V50 A16 16 0 0 0 206 50 V30" fill="none" stroke={C.navy} strokeWidth="4" strokeLinecap="round" />
      <path d="M190 66 V84 A12 12 0 0 0 214 84 V78" fill="none" stroke={C.navy} strokeWidth="4" strokeLinecap="round" />
      <circle cx="214" cy="72" r="7" fill={C.navy3} />
      <circle cx="214" cy="72" r="3" fill={C.navyLight} />
      {/* pill */}
      <rect x="168" y="96" width="40" height="15" rx="7.5" fill={C.sun} />
      <rect x="188" y="96" width="20" height="15" rx="7.5" fill={C.white} />
      <rect x="186" y="96" width="6" height="15" fill={C.white} />
      {ground}
    </>
  ),
  engineering: (
    <>
      {/* crane */}
      <rect x="66" y="30" width="9" height="84" fill={C.sun} />
      <path d="M66 40 L75 52 M75 52 L66 64 M66 64 L75 76 M75 76 L66 88 M66 88 L75 100" stroke={C.sunDeep} strokeWidth="2" />
      <rect x="42" y="26" width="128" height="7" rx="2" fill={C.sun} />
      <rect x="42" y="33" width="14" height="10" rx="2" fill={C.navy2} />
      <rect x="75" y="34" width="13" height="11" rx="2" fill={C.navy} />
      <line x1="150" y1="33" x2="150" y2="56" stroke={C.navy} strokeWidth="2" />
      <rect x="136" y="56" width="30" height="6" rx="1.5" fill={C.navy2} />
      {/* building frame */}
      <rect x="120" y="70" width="60" height="44" fill={C.white} stroke={C.navy} strokeWidth="3" />
      <line x1="140" y1="70" x2="140" y2="114" stroke={C.navy} strokeWidth="3" />
      <line x1="160" y1="70" x2="160" y2="114" stroke={C.navy} strokeWidth="3" />
      <line x1="120" y1="92" x2="180" y2="92" stroke={C.navy} strokeWidth="3" />
      <rect x="125" y="96" width="10" height="14" fill={C.tealPale} />
      <rect x="165" y="75" width="10" height="13" fill={C.tealPale} />
      {/* hard hat */}
      <path d="M192 108 A16 15 0 0 1 224 108 Z" fill={C.sun} />
      <rect x="188" y="106" width="40" height="6" rx="3" fill={C.sunDeep} />
      <rect x="206" y="94" width="4" height="12" rx="2" fill={C.sunDeep} />
      {ground}
    </>
  ),
  business: (
    <>
      {/* market stall */}
      <rect x="34" y="30" width="90" height="18" fill={C.teal} />
      <rect x="46" y="30" width="11" height="18" fill={C.white} />
      <rect x="68" y="30" width="11" height="18" fill={C.white} />
      <rect x="90" y="30" width="11" height="18" fill={C.white} />
      <rect x="112" y="30" width="11" height="18" fill={C.white} />
      <rect x="38" y="48" width="4" height="66" fill={C.navy2} />
      <rect x="116" y="48" width="4" height="66" fill={C.navy2} />
      <rect x="38" y="76" width="82" height="38" rx="3" fill={C.white} stroke={C.navy} strokeWidth="3" />
      <circle cx="56" cy="70" r="7" fill={C.sun} />
      <circle cx="72" cy="70" r="7" fill={C.coral} />
      <circle cx="88" cy="70" r="7" fill={C.tealMid} />
      <circle cx="104" cy="70" r="7" fill={C.sun} />
      {/* coins and growth arrow */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={`a${i}`} cx="160" cy={106 - i * 8} rx="16" ry="5" fill={C.sun} stroke={C.sunDeep} strokeWidth="2" />
      ))}
      {[0, 1].map((i) => (
        <ellipse key={`b${i}`} cx="198" cy={106 - i * 8} rx="16" ry="5" fill={C.sun} stroke={C.sunDeep} strokeWidth="2" />
      ))}
      <path d="M138 62 L162 44 L178 52 L212 26" fill="none" stroke={C.navy} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M198 26 H212 V40" fill="none" stroke={C.navy} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {ground}
    </>
  ),
  'law-society': (
    <>
      {/* scales of justice */}
      <rect x="64" y="38" width="5" height="68" fill={C.navy} />
      <rect x="48" y="106" width="38" height="8" rx="2" fill={C.navy} />
      <rect x="32" y="40" width="70" height="5" rx="2.5" fill={C.sun} />
      <circle cx="66.5" cy="36" r="6" fill={C.sun} />
      <path d="M38 45 L28 74 M38 45 L48 74 M96 45 L86 70 M96 45 L106 70" stroke={C.navy3} strokeWidth="2" />
      <path d="M24 74 H52 A14 8 0 0 1 24 74 Z" fill={C.sunDeep} />
      <path d="M82 70 H110 A14 8 0 0 1 82 70 Z" fill={C.sunDeep} />
      {/* court building */}
      <path d="M124 54 L166 30 L208 54 Z" fill={C.navy} />
      <rect x="128" y="54" width="76" height="6" fill={C.navy2} />
      {[134, 152, 170, 188].map((x) => (
        <rect key={x} x={x} y="62" width="10" height="38" fill={C.white} stroke={C.navy2} strokeWidth="2" />
      ))}
      <rect x="124" y="100" width="84" height="7" fill={C.navy} />
      <rect x="118" y="107" width="96" height="7" fill={C.navy2} />
      <circle cx="166" cy="45" r="4" fill={C.sun} />
      {ground}
    </>
  ),
  media: (
    <>
      {/* microphone */}
      <rect x="56" y="30" width="28" height="44" rx="14" fill={C.navy} />
      <path d="M62 44 H78 M62 52 H78 M62 60 H78" stroke={C.navy3} strokeWidth="3" strokeLinecap="round" />
      <path d="M46 62 A24 24 0 0 0 94 62" fill="none" stroke={C.navy3} strokeWidth="4" strokeLinecap="round" />
      <rect x="68" y="86" width="4" height="20" fill={C.navy3} />
      <rect x="52" y="106" width="36" height="6" rx="3" fill={C.navy} />
      <path d="M100 42 A16 16 0 0 1 100 66 M108 34 A28 28 0 0 1 108 74" fill="none" stroke={C.sun} strokeWidth="3.5" strokeLinecap="round" />
      {/* speech bubble */}
      <rect x="124" y="24" width="90" height="46" rx="11" fill={C.white} stroke={C.tealPale} strokeWidth="2" />
      <path d="M140 70 L134 82 L152 70 Z" fill={C.white} />
      <rect x="136" y="36" width="54" height="5" rx="2.5" fill={C.teal} />
      <rect x="136" y="47" width="66" height="5" rx="2.5" fill={C.navyLight} />
      <rect x="136" y="58" width="40" height="5" rx="2.5" fill={C.navyLight} />
      {/* video card */}
      <rect x="152" y="80" width="62" height="32" rx="7" fill={C.teal} />
      <path d="M177 88 L193 96 L177 104 Z" fill={C.white} />
      {ground}
    </>
  ),
  'education-care': (
    <>
      {/* chalkboard on easel */}
      <path d="M58 96 L46 116 M128 96 L140 116" stroke={C.sunDeep} strokeWidth="4" strokeLinecap="round" />
      <rect x="34" y="26" width="118" height="72" rx="5" fill={C.sunDeep} />
      <rect x="40" y="32" width="106" height="60" rx="3" fill={C.tealDark} />
      <path d="M50 46 H88" stroke={C.white} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 58 H98 M50 70 H82 M50 82 H92" stroke={C.white} strokeWidth="2.5" opacity=".7" strokeLinecap="round" />
      <path d="M110 64 L118 72 L134 52" stroke={C.sun} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* books and cap */}
      <rect x="166" y="98" width="52" height="12" rx="2" fill={C.navy} />
      <rect x="170" y="86" width="46" height="12" rx="2" fill={C.teal} />
      <rect x="164" y="74" width="50" height="12" rx="2" fill={C.sun} />
      <rect x="170" y="78" width="38" height="2" fill={C.white} opacity=".6" />
      <path d="M166 52 L190 42 L214 52 L190 62 Z" fill={C.navy} />
      <path d="M180 56 V64 A10 4 0 0 0 200 64 V56" fill={C.navy2} />
      <path d="M190 52 L210 60 V70" stroke={C.sun} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="210" cy="72" r="3" fill={C.sun} />
      {ground}
    </>
  ),
  agriculture: (
    <>
      <circle cx="188" cy="38" r="17" fill={C.sun} />
      <path d="M188 12 V18 M188 58 V64 M162 38 H168 M208 38 H214 M170 20 L174 24 M202 52 L206 56 M206 20 L202 24 M174 52 L170 56" stroke={C.sun} strokeWidth="3" strokeLinecap="round" />
      <path d="M0 98 Q60 80 120 96 T240 92 V140 H0 Z" fill={C.tealLight} />
      <path d="M0 116 Q80 98 160 112 T240 108 V140 H0 Z" fill={C.teal} />
      {/* crop rows */}
      <path d="M20 128 Q90 114 170 126 M40 136 Q110 124 200 134" stroke={C.tealDark} strokeWidth="2" fill="none" opacity=".5" />
      {/* big seedling */}
      <path d="M70 104 V58" stroke={C.tealDark} strokeWidth="4" strokeLinecap="round" />
      <path d="M70 74 C54 74 44 62 44 50 C58 50 70 60 70 74 Z" fill={C.tealMid} />
      <path d="M70 66 C86 66 96 54 96 42 C82 42 70 52 70 66 Z" fill={C.tealMid} />
      <path d="M70 58 C70 48 74 40 82 36" stroke={C.tealDark} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* small sprouts */}
      {[112, 138, 164].map((x, i) => (
        <g key={x}>
          <path d={`M${x} ${100 - i * 2} V${86 - i * 2}`} stroke={C.tealDark} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx={x - 6} cy={88 - i * 2} rx="7" ry="4" fill={C.tealMid} transform={`rotate(-25 ${x - 6} ${88 - i * 2})`} />
          <ellipse cx={x + 6} cy={86 - i * 2} rx="7" ry="4" fill={C.tealMid} transform={`rotate(25 ${x + 6} ${86 - i * 2})`} />
        </g>
      ))}
    </>
  ),
  creative: (
    <>
      {/* paint palette and brush */}
      <path
        d="M30 74 C30 50 52 34 78 34 C104 34 118 48 118 64 C118 76 108 80 98 78 C90 76 84 82 88 90 C92 100 84 108 70 108 C46 108 30 94 30 74 Z"
        fill={C.white}
        stroke={C.sand}
        strokeWidth="3"
      />
      <circle cx="54" cy="58" r="7" fill={C.coral} />
      <circle cx="76" cy="48" r="7" fill={C.sun} />
      <circle cx="98" cy="56" r="7" fill={C.teal} />
      <circle cx="50" cy="82" r="7" fill={C.navy3} />
      <circle cx="68" cy="92" r="5" fill={C.tealPale} />
      <path d="M96 106 L132 70" stroke={C.navy} strokeWidth="5" strokeLinecap="round" />
      <path d="M132 70 L140 62 L146 64 L144 70 L136 74 Z" fill={C.sun} />
      {/* dress form */}
      <path
        d="M182 30 C172 30 166 36 164 44 L160 66 C166 72 166 80 160 86 L166 100 H198 L204 86 C198 80 198 72 204 66 L200 44 C198 36 192 30 182 30 Z"
        fill={C.teal}
      />
      <path d="M163 62 C176 70 190 70 201 62" stroke={C.sun} strokeWidth="3" fill="none" strokeDasharray="4 3" />
      <rect x="179" y="100" width="6" height="12" fill={C.navy} />
      <rect x="166" y="110" width="32" height="5" rx="2.5" fill={C.navy} />
      <circle cx="182" cy="26" r="4" fill={C.navy} />
    </>
  ),
  technical: (
    <>
      {/* gear */}
      <circle cx="46" cy="42" r="20" fill="none" stroke={C.navy} strokeWidth="9" strokeDasharray="7.3 5.5" />
      <circle cx="46" cy="42" r="15" fill={C.navy} />
      <circle cx="46" cy="42" r="6" fill="#edf7f3" />
      {/* wrench */}
      <path d="M38 112 L76 80" stroke={C.teal} strokeWidth="10" strokeLinecap="round" />
      <circle cx="84" cy="74" r="13" fill={C.teal} />
      <rect x="83" y="60" width="10" height="14" fill="#edf7f3" transform="rotate(42 88 67)" />
      {/* lightning */}
      <path d="M124 26 L110 58 H122 L114 84 L138 48 H126 L134 26 Z" fill={C.sun} />
      {/* solar panel */}
      <path d="M142 66 L206 56 L220 92 L156 102 Z" fill={C.navy2} />
      <path d="M163 63 L177 99 M185 59 L199 95 M149 78 L213 68 M152 90 L216 80" stroke={C.navyLight} strokeWidth="1.5" />
      <rect x="179" y="98" width="5" height="16" fill={C.navy} />
      <circle cx="210" cy="32" r="10" fill={C.sun} />
      {ground}
    </>
  ),
}

/** Used for career areas added later that don't have their own drawing. */
const FALLBACK = (
  <>
    <path d="M30 104 C70 104 76 70 110 70 S150 36 196 36" fill="none" stroke={C.tealMid} strokeWidth="8" strokeLinecap="round" />
    <path d="M30 104 C70 104 76 70 110 70 S150 36 196 36" fill="none" stroke="#edf7f3" strokeWidth="2" strokeDasharray="5 8" strokeLinecap="round" />
    <circle cx="30" cy="104" r="9" fill={C.sun} stroke={C.navy} strokeWidth="3" />
    <circle cx="110" cy="70" r="9" fill={C.tealLight} stroke={C.navy} strokeWidth="3" />
    <circle cx="196" cy="36" r="9" fill={C.white} stroke={C.navy} strokeWidth="3" />
  </>
)

export function CategoryArt({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 240 140" className={className} aria-hidden="true" focusable="false">
      <rect width="240" height="140" fill="#edf7f3" />
      <circle cx="200" cy="26" r="46" fill={C.white} opacity=".55" />
      {SCENES[id] ?? FALLBACK}
    </svg>
  )
}
