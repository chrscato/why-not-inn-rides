// Receipt-first host. Renders one ride landing + the bottom RidePicker docket.

window.RidesApp = function RidesApp() {
  const [rideId, setRideId] = React.useState(RIDES[0].id);
  const ride = RIDES.find((r) => r.id === rideId) || RIDES[0];
  const docketRef = React.useRef(null);

  const jumpToAnother = () => {
    const others = RIDES.filter((r) => r.id !== rideId);
    if (others.length === 0) return;
    const next = others[Math.floor(Math.random() * others.length)];
    setRideId(next.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: BRAND.cream }}>
      <LandingReceipt ride={ride} onCTA={jumpToAnother} />
      <div ref={docketRef}>
        <RidePicker rideId={rideId} setRideId={setRideId} />
      </div>
    </div>
  );
};

// Strip of cards across the bottom — pick which case fills the landing.
window.RidePicker = function RidePicker({ rideId, setRideId }) {
  const vp = useViewport();
  const fmt = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  const cardMin = vp.isMobile ? 200 : 220;
  return (
    <div style={{
      background: '#fff', borderTop: `1px solid ${BRAND.hair}`,
      padding: vp.isMobile ? '12px 16px' : '14px 32px',
      // Reserve room on iOS so the home-indicator doesn't sit on the cards.
      paddingBottom: vp.isMobile ? 'calc(12px + env(safe-area-inset-bottom, 0px))' : 14,
    }}>
      <div style={{
        fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.2em',
        color: BRAND.muted, marginBottom: 10,
      }}>
        TODAY'S DOCKET · {RIDES.length} CASES · {vp.isTouch ? 'SWIPE' : 'TAP'} TO LOAD
      </div>
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4,
        WebkitOverflowScrolling: 'touch',
        scrollSnapType: vp.isMobile ? 'x mandatory' : 'none',
      }}>
        {RIDES.map((r) => {
          const active = r.id === rideId;
          const waste = r.awarded - r.innRate - r.rideCost;
          return (
            <button key={r.id} onClick={() => setRideId(r.id)} style={{
              flexShrink: 0, minWidth: cardMin, textAlign: 'left',
              background: active ? BRAND.navy : '#fff',
              color: active ? '#fff' : BRAND.ink,
              border: `1px solid ${active ? BRAND.navy : BRAND.border}`,
              borderTop: `3px solid ${active ? BRAND.rust : 'transparent'}`,
              borderRadius: 6, padding: '10px 14px', cursor: 'pointer',
              fontFamily: FONT.ui,
              scrollSnapAlign: vp.isMobile ? 'start' : 'none',
            }}>
              <div style={{
                fontFamily: FONT.mono, fontSize: 9.5, letterSpacing: '0.12em',
                color: active ? 'rgba(255,255,255,0.7)' : BRAND.muted,
                marginBottom: 4,
              }}>
                {r.cpt} · {r.state} · {r.insurer}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {r.punchline}
              </div>
              <div style={{
                fontFamily: FONT.mono, fontSize: 11,
                color: active ? '#f5a89f' : BRAND.rust, fontWeight: 600,
              }}>
                gap {fmt(waste)} · {r.miles} mi
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
