export default function TrustBadges() {
  const badges = [
    { icon: '🎖️', label: 'Veteran-Owned', sub: 'Service-Disabled' },
    { icon: '🏥', label: 'Healthcare IT', sub: '10+ Years' },
    { icon: '🤖', label: 'AI-First', sub: 'Automation' },
    { icon: '🔒', label: '100% Secure', sub: 'SSL Encrypted' },
  ]

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '30px',
      flexWrap: 'wrap',
      padding: '30px 0',
      borderTop: '1px solid rgba(235, 203, 76, 0.15)',
      marginTop: '40px',
    }}>
      {badges.map((badge) => (
        <div key={badge.label} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '24px' }}>{badge.icon}</span>
          <div>
            <div style={{
              fontFamily: "'Arial Black', sans-serif",
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: '12px',
              color: '#ebcb4c',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {badge.label}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#888',
              fontFamily: "'Space Mono', monospace",
            }}>
              {badge.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
