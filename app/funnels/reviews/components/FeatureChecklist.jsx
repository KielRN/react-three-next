export default function FeatureChecklist({ features, color = '#1a8a4f' }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {features.map((f) => (
        <li
          key={f}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '12px',
            fontSize: '14px',
            color: '#333',
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: color,
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ✓
          </span>
          {f}
        </li>
      ))}
    </ul>
  )
}
