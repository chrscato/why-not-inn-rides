// The Receipt — thermal-printer style breakdown.
// Used as the math artifact across all variants.

window.Receipt = function Receipt({ ride, variant = 'thermal', width = 360 }) {
  const delta = ride.awarded - ride.innRate;
  const totalWaste = ride.awarded - ride.innRate - ride.rideCost;
  const fmt = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  const fmtCents = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const bg = variant === 'thermal' ? '#fafcfd' : '#ffffff';
  const ink = BRAND.navy;

  return (
    <div style={{
      width,
      background: bg,
      fontFamily: FONT.mono,
      fontSize: 11.5,
      lineHeight: 1.55,
      color: ink,
      position: 'relative',
      padding: '24px 28px 28px',
      boxShadow: variant === 'thermal'
        ? '0 1px 0 rgba(0,0,0,0.04), 0 30px 50px -20px rgba(0,0,0,0.22)'
        : '0 1px 2px rgba(0,0,0,0.05)',
    }}>
      {/* Scallop top */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -8, left: 0, right: 0, height: 9,
        backgroundImage: `radial-gradient(circle at 8px 9px, ${bg} 6px, transparent 6.5px)`,
        backgroundSize: '16px 9px', backgroundRepeat: 'repeat-x',
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
          WHY·NOT·INN
        </div>
        <div style={{ fontSize: 9.5, letterSpacing: '0.24em', color: BRAND.muted, marginTop: 2 }}>
          · FARE RECEIPT ·
        </div>
      </div>

      <div style={{ borderTop: `1px dashed ${BRAND.hairStrong}`, margin: '10px 0' }} />

      {/* Route */}
      <div style={{ marginBottom: 10 }}>
        <Row k="DATE" v={ride.quarter.replace('-', ' ')} />
        <Row k="CPT/HCPCS" v={ride.cpt} />
        <Row k="SERVICE" v={ride.cptName.slice(0, 28).toUpperCase()} wrap />
        <Row k="STATE" v={ride.state} />
        <Row k="PAYER" v={ride.insurer.toUpperCase()} wrap />
      </div>

      <div style={{ borderTop: `1px dashed ${BRAND.hairStrong}`, margin: '10px 0' }} />

      {/* Route trip */}
      <div style={{ fontSize: 10, letterSpacing: '0.12em', color: BRAND.muted, marginBottom: 6 }}>
        TRIP
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 3 }}>
        <div style={{ color: BRAND.navy, fontWeight: 700, marginTop: 1 }}>A</div>
        <div style={{ flex: 1 }}>
          {ride.pickup.label}<br />
          <span style={{ color: BRAND.muted, fontSize: 10 }}>{ride.pickup.city}</span>
        </div>
      </div>
      <div style={{ color: BRAND.hairStrong, margin: '2px 0 2px 4px', letterSpacing: '3px' }}>
        │<br />│
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ color: BRAND.rust, fontWeight: 700, marginTop: 1 }}>C</div>
        <div style={{ flex: 1 }}>
          {ride.dropoff.label}<br />
          <span style={{ color: BRAND.muted, fontSize: 10 }}>{ride.dropoff.city}</span>
        </div>
      </div>
      <Row k="DISTANCE" v={`${ride.miles} mi`} />

      <div style={{ borderTop: `1px dashed ${BRAND.hairStrong}`, margin: '10px 0' }} />

      {/* Math */}
      <div style={{ fontSize: 10, letterSpacing: '0.12em', color: BRAND.muted, marginBottom: 6 }}>
        THE MATH
      </div>
      <BigRow k="Arbitrator awarded" v={fmt(ride.awarded)} strong />
      <BigRow k="Comparable INN rate" v={'– ' + fmt(ride.innRate)} muted />
      <div style={{ borderTop: `1px solid ${BRAND.hairStrong}`, margin: '6px 0' }} />
      <BigRow k="Overpayment" v={fmt(delta)} />
      <BigRow k="UberX fare" v={'– ' + fmtCents(ride.rideCost)} muted />

      <div style={{ borderTop: `2px solid ${ink}`, margin: '8px 0' }} />
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        padding: '6px 0',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>COULD'VE SAVED</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.rust, fontFamily: FONT.mono }}>
          {fmt(totalWaste)}
        </div>
      </div>

      <div style={{ borderTop: `1px dashed ${BRAND.hairStrong}`, margin: '10px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 9.5, color: BRAND.muted, lineHeight: 1.7 }}>
        Source: CMS Federal IDR PUF + public MRF files<br />
        Ride cost: UberX estimate, no surge<br />
        <span style={{ letterSpacing: '0.3em' }}>* * *</span><br />
        
      </div>

      {/* Barcode */}
      <div style={{ marginTop: 10, display: 'flex', gap: 1.5, justifyContent: 'center' }}>
        {Array.from({ length: 38 }).map((_, i) => (
          <div key={i} style={{
            width: (i * 7 + ride.awarded) % 3 === 0 ? 2 : 1,
            height: 26,
            background: ink,
            opacity: (i * 3 + 1) % 5 === 0 ? 0.25 : 1,
          }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 9, marginTop: 4, letterSpacing: '0.25em', color: BRAND.muted }}>
        {ride.id.toUpperCase()}
      </div>

      {/* Scallop bottom */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: -8, left: 0, right: 0, height: 9,
        backgroundImage: `radial-gradient(circle at 8px 0, ${bg} 6px, transparent 6.5px)`,
        backgroundSize: '16px 9px', backgroundRepeat: 'repeat-x',
      }} />
    </div>
  );
};

function Row({ k, v, wrap }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 12,
      fontSize: 10.5, padding: '1px 0',
    }}>
      <span style={{ color: BRAND.muted }}>{k}</span>
      <span style={{
        textAlign: 'right',
        maxWidth: wrap ? '60%' : 'none',
        wordBreak: wrap ? 'break-word' : 'normal',
      }}>{v}</span>
    </div>
  );
}

function BigRow({ k, v, strong, muted }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline',
      padding: '2px 0',
    }}>
      <span style={{ fontSize: 11, color: muted ? BRAND.muted : BRAND.ink }}>{k}</span>
      <span style={{
        fontSize: strong ? 15 : 13,
        fontWeight: strong ? 700 : 500,
        color: muted ? BRAND.muted : BRAND.ink,
      }}>{v}</span>
    </div>
  );
}
