// "The Receipt" landing — BPH brand (navy + red, light surfaces).
// Full-bleed thermal receipt aesthetic. Big receipt, map inset, ticker at bottom.

window.LandingReceipt = function LandingReceipt({ ride, onCTA }) {
  // Other tabs hidden for now — only Rides is live.
  const NAV_LINKS = [
    { label: 'Rides',      href: '#',                          active: true  },
    // { label: 'Dashboard',  href: './dashboard.html#/',         active: false },
    // { label: 'Explorer',   href: './dashboard.html#/explorer', active: false },
    // { label: 'Map',        href: './dashboard.html#/map',      active: false },
    // { label: 'About',      href: './dashboard.html#/about',    active: false },
  ];
  const vp = useViewport();
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    if (vp.reducedMotion) { setProgress(1); return; }
    let start = 0;
    const id = setInterval(() => {
      start += 0.012;
      if (start >= 1) { setProgress(1); clearInterval(id); }
      else setProgress(start);
    }, 40);
    return () => clearInterval(id);
  }, [ride.id, vp.reducedMotion]);

  const fmt = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  const waste = ride.awarded - ride.innRate - ride.rideCost;

  // Responsive sizing — driven by useViewport.
  const pad       = vp.isMobile ? 18 : vp.isTablet ? 32 : 64;
  const heroPadY  = vp.isMobile ? 36 : vp.isTablet ? 48 : 56;
  // Fluid hero — clamps between 36 and 92 across the full viewport range,
  // so it scales smoothly on 320 px phones and 1440+ desktops.
  const heroFs    = Math.min(92, Math.max(36, Math.round(vp.width * 0.11)));
  const heroSubFs = vp.width < 360 ? 14 : vp.isMobile ? 15 : 17;
  const abcCols   = vp.isMobile ? '1fr' : 'repeat(3, 1fr)';
  const abcGap    = vp.isMobile ? 32 : 24;
  const stackMain = vp.isStack;
  const gapMain   = stackMain ? 32 : 56;
  const receiptW  = vp.isMobile
    ? Math.max(280, Math.min(vp.width - pad * 2 - 4, 380))
    : 380;
  const mathFs    = vp.isMobile ? 19 : 26;
  const tickerFs  = vp.isMobile ? 11 : 13;
  const tickerGap = vp.isMobile ? 22 : 48;

  return (
    <div style={{ background: BRAND.cream, minHeight: '100vh', fontFamily: FONT.ui, color: BRAND.ink }}>
      {/* Topbar — matches existing app navy gradient */}
      <div style={{
        background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyMid} 100%)`,
        color: '#fff',
        padding: vp.isMobile ? '12px 16px' : '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `3px solid ${BRAND.rust}`,
        boxShadow: '0 4px 16px rgba(20,48,77,0.25)',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <img src={(window.__resources && window.__resources.logo) || 'assets/logo.png'} alt=""
            style={{ height: vp.isMobile ? 30 : 38, flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: FONT.display,
              fontSize: vp.isMobile ? 16 : 20,
              fontWeight: 700, letterSpacing: '0.2px', lineHeight: 1.1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              Why Not In-Network?
            </div>
            {!vp.isMobile && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                An alternative analysis of IDR disputes
              </div>
            )}
          </div>
        </div>
        {!vp.isMobile && (
          <nav style={{ display: 'flex', gap: 4, fontSize: 13, flexShrink: 0 }}>
            {NAV_LINKS.map((n) => (
              <a key={n.label} href={n.href} style={{
                padding: '6px 12px',
                color: n.active ? '#fff' : 'rgba(255,255,255,0.75)',
                fontWeight: n.active ? 700 : 500,
                borderBottom: n.active ? '2px solid rgba(255,255,255,0.85)' : '2px solid transparent',
                textDecoration: 'none',
              }}>{n.label}</a>
            ))}
          </nav>
        )}
      </div>

      {/* Hero */}
      <div style={{
        padding: `${heroPadY}px ${pad}px ${vp.isMobile ? 24 : 28}px`,
        textAlign: 'center',
      }}>

        <h1 className="wn-display" style={{
          fontSize: heroFs, lineHeight: 0.95, margin: 0, fontWeight: 700,
          letterSpacing: '-0.025em', color: BRAND.navy,
        }}>
          Why not Uber to an<br />
          <span style={{ fontStyle: 'italic', fontWeight: 500, color: BRAND.rust }}>
            in-network provider?
          </span>
        </h1>
        <p style={{
          maxWidth: 680,
          margin: `${vp.isMobile ? 18 : 28}px auto 0`,
          fontSize: heroSubFs, lineHeight: 1.6,
          color: BRAND.inkSoft,
        }}>
          An analysis of what IDR disputes would look like if patients
          had just taken a car to a nearby in-network provider instead.
        </p>
      </div>

      {/* Receipt + Map */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: stackMain ? '1fr' : '1.15fr 1fr',
        gap: gapMain,
        padding: `0 ${pad}px ${vp.isMobile ? 40 : 64}px`,
        alignItems: 'start',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: stackMain ? 'center' : 'flex-end',
          paddingTop: stackMain ? 0 : 28,
        }}>
          <Receipt ride={ride} width={receiptW} />
        </div>
        <div style={{ paddingTop: stackMain ? 0 : 48, minWidth: 0 }}>

          <div style={{
            background: '#fff', padding: vp.isMobile ? 10 : 16,
            border: `1px solid ${BRAND.border}`, borderTop: `3px solid ${BRAND.navy}`,
            borderRadius: 8, boxShadow: '0 2px 8px rgba(20,48,77,0.08)',
          }}>
            <RouteMap
              width={520} height={340}
              pickup={ride.pickup} dropoff={ride.dropoff}
              pickupBadge="A" dropoffBadge="C"
              miles={ride.miles} progress={progress}
              meterValue={'$' + (ride.rideCost * progress).toFixed(2)}
            />
          </div>

          <div style={{ marginTop: vp.isMobile ? 24 : 32 }}>

            <div className="wn-display" style={{
              fontSize: mathFs, lineHeight: 1.3, marginBottom: 14,
              fontWeight: 500, color: BRAND.navy,
            }}>
              The arbitrator awarded <b style={{ color: BRAND.rust }}>{fmt(ride.awarded)}</b>.
              The in-network rate is <b>{fmt(ride.innRate)}</b>.
              The Uber is <b>${ride.rideCost}</b>.
              That's <b style={{ color: BRAND.rust }}>{fmt(waste)}</b> that didn't need to happen.
            </div>
            <div className="wn-mono" style={{ fontSize: 12, color: BRAND.inkSoft }}>
              {ride.miles} mi · payer: {ride.insurer} · {ride.quarter}
            </div>
            {ride.innRateAsOf && (
              <div className="wn-mono" style={{ fontSize: 10, color: BRAND.muted, marginTop: 6, letterSpacing: '0.04em' }}>
                In-network rate sourced from public MRF data as of {ride.innRateAsOf}.
              </div>
            )}
            {ride.rideCostAsOf && (
              <div className="wn-mono" style={{ fontSize: 10, color: BRAND.muted, marginTop: 2, letterSpacing: '0.04em' }}>
                Ride cost is a {ride.rideCostNote || 'modeled estimate'} as of {ride.rideCostAsOf}.
              </div>
            )}

            {/* Disclaimer */}
            <div style={{
              marginTop: vp.isMobile ? 20 : 28,
              padding: vp.isMobile ? '12px 14px' : '14px 18px',
              background: BRAND.creamDeep,
              border: `1px solid ${BRAND.border}`,
              borderRadius: 6,
              fontSize: vp.isMobile ? 12 : 12.5,
              lineHeight: 1.6,
              color: BRAND.inkSoft,
            }}>
              <b style={{ color: BRAND.navy }}>Yes, we know it's not that simple.</b>{' '}
              You can't always choose your provider. Emergencies don't ask for your network directory.
              The math is all public data, just takes a little work.
              We're adding one more visual to an already crowded arena of opinions, because sometimes the
              absurdity is clearer when you put a dollar sign on the Uber.
            </div>

            <button onClick={onCTA} style={{
              marginTop: vp.isMobile ? 16 : 20,
              background: BRAND.rust, color: '#fff',
              border: 'none',
              padding: vp.isMobile ? '14px 18px' : '12px 20px',
              fontFamily: FONT.ui,
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 6,
              width: vp.isMobile ? '100%' : 'auto',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 2px 6px rgba(197,55,46,0.25)',
            }}>
              More receipts
              <span style={{ fontFamily: FONT.mono }}>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div style={{
        background: `linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navyDeep} 100%)`,
        color: '#fff',
        paddingTop: vp.isMobile ? 12 : 14,
        paddingBottom: vp.isMobile ? 14 : 18,
        overflow: 'hidden', borderTop: `4px solid ${BRAND.rust}`,
      }}>
        <div style={{
          padding: `0 ${pad}px`,
          fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.55)', fontWeight: 600,
          marginBottom: vp.isMobile ? 8 : 10,
          display: 'flex', justifyContent: 'space-between', gap: 12,
        }}>
          <span>COSTLY UBER RIDES:</span>
          
        </div>
        <div className="wn-ticker" style={{
          display: 'flex', whiteSpace: 'nowrap', gap: tickerGap, fontFamily: FONT.mono,
          fontSize: tickerFs,
        }}>
          {[...RIDES, ...RIDES].map((r, i) => (
            <span key={i} style={{ flexShrink: 0 }}>
              <span style={{ color: '#f5a89f', fontWeight: 700 }}>
                ${(r.awarded - r.innRate - r.rideCost).toLocaleString()}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}></span>
              <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 12px' }}>·</span>
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>{r.cpt} · {r.state}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 12px' }}>●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

function ABCCard({ badge, label, headline, sub, note, foot, accent }) {
  const stripe = accent || BRAND.navy;
  const vp = useViewport();
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${BRAND.border}`,
      borderTop: `3px solid ${stripe}`,
      borderRadius: 8,
      padding: '22px 22px 18px',
      boxShadow: '0 2px 8px rgba(20,48,77,0.08)',
      position: 'relative',
      display: 'flex', flexDirection: 'column', gap: 6,
      minHeight: vp.isMobile ? 0 : 168,
    }}>
      <div style={{
        position: 'absolute', top: -16, left: 18,
        width: 30, height: 30, borderRadius: '50%',
        background: stripe, color: '#fff',
        fontFamily: FONT.display, fontWeight: 700, fontSize: 15,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
      }}>{badge}</div>
      <div style={{
        fontFamily: FONT.mono, fontSize: 10, letterSpacing: '0.18em',
        color: BRAND.muted, fontWeight: 600, marginTop: 4,
      }}>{label}</div>
      <div className="wn-display" style={{
        fontSize: 19, fontWeight: 600, color: BRAND.navy, lineHeight: 1.25,
      }}>{headline}</div>
      {sub && (
        <div className="wn-mono" style={{ fontSize: 12, color: BRAND.inkSoft }}>{sub}</div>
      )}
      {note && (
        <div style={{
          fontSize: 12.5, color: BRAND.inkSoft, lineHeight: 1.5, marginTop: 2,
        }}>{note}</div>
      )}
      {foot && (
        <div className="wn-mono" style={{
          fontSize: 10, color: BRAND.muted, letterSpacing: '0.06em',
          marginTop: 'auto', paddingTop: 10,
        }}>{foot}</div>
      )}
    </div>
  );
}
