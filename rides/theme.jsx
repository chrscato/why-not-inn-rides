// Shared theme + primitives.

// Matches frontend-react/style.css — the BPH navy + red brand the app already ships.
window.BRAND = {
  navy: '#14304d',      // --navy
  navyMid: '#1a3f5e',   // --navy-2
  navyDeep: '#0d2238',  // --navy-deep
  rust: '#c5372e',      // --red (kept the name "rust" internally — maps to brand red)
  rustDeep: '#a82d25',  // --red-hover
  cream: '#f8fafb',     // --bg-light
  creamDeep: '#f0f3f7', // --bg-hero
  paper: '#ffffff',     // --bg-white
  ink: '#1a2a3a',       // --text-dark
  inkSoft: '#3a4a5a',   // --text-mid
  muted: '#5a6a7a',     // --text-light
  faint: '#7a8a9a',     // --text-muted
  border: '#dde3ea',
  borderLight: '#e8ecf0',
  hair: '#e8ecf0',
  hairStrong: '#dde3ea',
};

window.FONT = {
  display: "'Source Serif 4', Georgia, serif",
  ui: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
};

// Inject shared styles + fonts once.
if (!document.getElementById('wn-shared')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;0,8..60,800;1,8..60,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'wn-shared';
  s.textContent = `
    .wn-mono { font-family: ${FONT.mono}; font-variant-numeric: tabular-nums; }
    .wn-ui { font-family: ${FONT.ui}; }
    .wn-display { font-family: ${FONT.display}; letter-spacing: -0.02em; }
    .wn-ticker { animation: wn-ticker-scroll 80s linear infinite; }
    @keyframes wn-ticker-scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @keyframes wn-meter-blink {
      0%, 60% { opacity: 1; }
      80%, 100% { opacity: 0.2; }
    }
    .wn-blink { animation: wn-meter-blink 1.2s steps(2, start) infinite; }
    @media (prefers-reduced-motion: reduce) {
      .wn-ticker { animation: none; }
      .wn-blink  { animation: none; opacity: 1; }
    }
    .wn-dashed {
      background-image: linear-gradient(to right, currentColor 50%, transparent 50%);
      background-size: 8px 1px;
      background-repeat: repeat-x;
      background-position: 0 center;
    }
    .wn-scallop-top, .wn-scallop-bot {
      position: relative;
    }
    .wn-scallop-top::before, .wn-scallop-bot::after {
      content: '';
      display: block;
      height: 10px;
      background-image: radial-gradient(circle at 8px 0, transparent 5px, currentColor 5.5px);
      background-size: 16px 10px;
      background-repeat: repeat-x;
    }
    .wn-scallop-top::before { transform: translateY(-1px); }
    .wn-scallop-bot::after { transform: translateY(1px) scaleY(-1); }
  `;
  document.head.appendChild(s);
}

// ── useViewport ────────────────────────────────────────────────────────
// Tracks viewport size + screen abilities (touch, reduced-motion). Re-renders
// callers on resize / orientation change. Use the booleans to drive layout
// decisions (isStack: stack two-column layouts; isMobile: phone-only tweaks).
window.useViewport = function useViewport() {
  const getVp = () => {
    if (typeof window === 'undefined') return { w: 1280, h: 800 };
    return { w: window.innerWidth, h: window.innerHeight };
  };
  const [vp, setVp] = React.useState(getVp);
  React.useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVp(getVp()));
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  const w = vp.w;
  const mq = (q) =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(q).matches : false;
  return {
    width: w,
    height: vp.h,
    isMobile:  w < 640,
    isTablet:  w >= 640 && w < 1024,
    isDesktop: w >= 1024,
    isStack:   w < 1024,
    isTouch:        mq('(pointer: coarse)'),
    reducedMotion:  mq('(prefers-reduced-motion: reduce)'),
  };
};

// ── Route Map ──────────────────────────────────────────────────────────
// Stylized tilted street grid + pickup/dropoff pins + animated route.
// All SVG, no tiles. Progress 0..1 animates the car along the route.

window.RouteMap = function RouteMap({
  width = 560,
  height = 360,
  pickup = { label: 'A', city: '' },
  dropoff = { label: 'B', city: '' },
  pickupBadge = 'A',
  dropoffBadge = 'B',
  miles = 10,
  progress = 1,
  theme = 'light',
  showMeter = true,
  meterValue = null,
  palette,
}) {
  const P = palette || {
    bg: theme === 'dark' ? BRAND.navyDeep : BRAND.creamDeep,
    road: theme === 'dark' ? '#16334f' : '#ffffff',
    roadLine: theme === 'dark' ? '#2a4a6a' : '#c8d2de',
    block: theme === 'dark' ? '#112a43' : '#e2e8ef',
    park: theme === 'dark' ? '#13384a' : '#d4e0d5',
    water: theme === 'dark' ? '#0f2640' : '#c8d4e2',
    route: BRAND.rust,
    text: theme === 'dark' ? '#e6ecf2' : BRAND.ink,
    pin: BRAND.navy,
  };

  // Seeded grid (deterministic per map based on miles so it looks different each ride)
  const seed = Math.max(1, Math.floor(miles));
  const rand = mulberry32(seed * 9301 + 49297);
  const blocks = [];
  for (let i = 0; i < 36; i++) {
    const x = (i % 6) * (width / 6) + rand() * 12;
    const y = Math.floor(i / 6) * (height / 6) + rand() * 10;
    const w = (width / 6) - 8 - rand() * 6;
    const h = (height / 6) - 8 - rand() * 6;
    const type = rand() < 0.08 ? 'park' : rand() < 0.04 ? 'water' : 'block';
    blocks.push({ x, y, w, h, type });
  }

  // Route: curvy bezier from lower-left to upper-right
  const start = { x: width * 0.14, y: height * 0.74 };
  const end = { x: width * 0.82, y: height * 0.22 };
  const c1 = { x: width * 0.35, y: height * 0.35 };
  const c2 = { x: width * 0.65, y: height * 0.65 };
  const routeD = `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;

  // Point along the bezier at t ∈ [0,1]
  const bez = (t) => {
    const mt = 1 - t;
    const x = mt * mt * mt * start.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * end.x;
    const y = mt * mt * mt * start.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * end.y;
    return { x, y };
  };
  const car = bez(Math.max(0.001, Math.min(0.999, progress)));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
      <defs>
        <pattern id="map-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill={P.water} />
          <path d="M0 3 L6 3" stroke={P.water} strokeOpacity="0.5" strokeWidth="1" />
        </pattern>
        <filter id="map-soft" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>

      {/* background */}
      <rect width={width} height={height} fill={P.bg} />

      {/* tilted grid world */}
      <g transform={`rotate(-6 ${width / 2} ${height / 2})`}>
        {/* blocks */}
        {blocks.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h}
            fill={b.type === 'park' ? P.park : b.type === 'water' ? 'url(#map-hatch)' : P.block}
            rx="1" />
        ))}

        {/* roads - horizontals */}
        {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
          <line key={'h' + i} x1={-30} x2={width + 30} y1={f * height} y2={f * height}
            stroke={P.road} strokeWidth={i === 1 || i === 2 ? 8 : 4} />
        ))}
        {/* verticals */}
        {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
          <line key={'v' + i} x1={f * width} x2={f * width} y1={-30} y2={height + 30}
            stroke={P.road} strokeWidth={i === 2 ? 10 : 4} />
        ))}
        {/* center lines on major roads */}
        <line x1={-30} x2={width + 30} y1={0.4 * height} y2={0.4 * height}
          stroke={P.roadLine} strokeWidth="1" strokeDasharray="6 6" />
        <line x1={0.6 * width} x2={0.6 * width} y1={-30} y2={height + 30}
          stroke={P.roadLine} strokeWidth="1" strokeDasharray="6 6" />
      </g>

      {/* route line (glow + solid) */}
      <path d={routeD} fill="none" stroke={P.route} strokeOpacity="0.18" strokeWidth="10" strokeLinecap="round" />
      <path d={routeD} fill="none" stroke={P.route} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1000"
        style={{ strokeDashoffset: 1000 * (1 - progress), transition: 'stroke-dashoffset 0.3s linear' }} />

      {/* pickup pin */}
      <g transform={`translate(${start.x}, ${start.y})`}>
        <circle r="9" fill="#fff" stroke={P.pin} strokeWidth="3" />
        <circle r="3" fill={P.pin} />
      </g>
      <g transform={`translate(${start.x + 14}, ${start.y + 4})`}>
        <rect x="0" y="-10" width={Math.max(90, pickup.label.length * 6.2)} height="22"
          fill="#fff" stroke={BRAND.hair} rx="2" />
        <text x="6" y="4" fontFamily={FONT.mono} fontSize="10" fill={P.text}>
          {pickupBadge + ' · ' + pickup.label.toUpperCase().slice(0, 16)}
        </text>
      </g>

      {/* dropoff pin (rust, filled) */}
      <g transform={`translate(${end.x}, ${end.y})`}>
        <path d="M0,-18 C-8,-18 -12,-12 -12,-7 C-12,0 0,10 0,10 C0,10 12,0 12,-7 C12,-12 8,-18 0,-18 Z"
          fill={P.route} stroke={P.route} strokeWidth="1" />
        <circle cx="0" cy="-8" r="3.5" fill="#fff" />
      </g>
      <g transform={`translate(${end.x + 14}, ${end.y - 12})`}>
        <rect x="0" y="-10" width={Math.max(100, dropoff.label.length * 6.2)} height="22"
          fill={BRAND.ink} rx="2" />
        <text x="6" y="4" fontFamily={FONT.mono} fontSize="10" fill="#fff">
          {dropoffBadge + ' · ' + dropoff.label.toUpperCase().slice(0, 18)}
        </text>
      </g>

      {/* car dot at current progress */}
      {progress < 1 && (
        <g transform={`translate(${car.x}, ${car.y})`}>
          <circle r="7" fill={P.route} stroke="#fff" strokeWidth="2" />
        </g>
      )}

      {/* meter in corner */}
      {showMeter && (
        <g transform={`translate(${width - 140}, 14)`}>
          <rect x="0" y="0" width="126" height="28" fill={BRAND.ink} rx="2" />
          <text x="8" y="12" fontFamily={FONT.mono} fontSize="8" fill="#8a8680" letterSpacing="0.1em">FARE</text>
          <text x="8" y="23" fontFamily={FONT.mono} fontSize="13" fontWeight="600" fill={BRAND.rust}>
            {meterValue != null ? meterValue : `$${(miles * 2.1 + 3).toFixed(2)}`}
          </text>
          <circle cx="115" cy="8" r="3" fill={BRAND.rust} className="wn-blink" />
        </g>
      )}
    </svg>
  );
};

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Site header (shared across variants) ───────────────────────────────
window.SiteHeader = function SiteHeader({ onNav, current = 'home', inverted = false }) {
  const items = [
    ['home', 'Rides'],
    ['explore', 'Fare calculator'],
    ['data', 'Dataset'],
    ['about', 'About'],
  ];
  const fg = inverted ? '#ffffff' : BRAND.navy;
  const muted = inverted ? 'rgba(255,255,255,0.7)' : BRAND.muted;
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 32px', fontFamily: FONT.ui, fontSize: 13, color: fg,
      borderBottom: `1px solid ${inverted ? 'rgba(245,241,232,0.12)' : BRAND.hair}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="wn-display" style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>
          IDR analysis
        </span>
      </div>
      <nav style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {items.map(([k, label]) => (
          <button key={k} onClick={() => onNav && onNav(k)}
            style={{
              background: 'transparent', border: 'none', padding: '6px 12px',
              color: current === k ? fg : muted,
              fontFamily: 'inherit', fontSize: 13, fontWeight: current === k ? 600 : 500,
              cursor: 'pointer', borderRadius: 4,
            }}>
            {label}
          </button>
        ))}
      </nav>
      <div style={{ fontFamily: FONT.mono, fontSize: 11, color: muted, letterSpacing: '0.04em' }}>
        5.24M disputes · thru 2025 Q2
      </div>
    </header>
  );
};

Object.assign(window, { BRAND, FONT });
