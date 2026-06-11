'use client'

export default function BillingToggle({ value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '32px',
      }}
    >
      <button
        type='button'
        onClick={() => onChange('monthly')}
        style={{
          background: value === 'monthly' ? '#0e2042' : 'transparent',
          color: value === 'monthly' ? '#ebcb4c' : '#0e2042',
          border: '2px solid #0e2042',
          padding: '8px 16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        Mensual
      </button>
      <button
        type='button'
        onClick={() => onChange('annual')}
        style={{
          background: value === 'annual' ? '#0e2042' : 'transparent',
          color: value === 'annual' ? '#ebcb4c' : '#0e2042',
          border: '2px solid #0e2042',
          padding: '8px 16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        Anual
      </button>
      {value === 'annual' && (
        <span
          style={{
            background: '#fff7d6',
            color: '#7a5b00',
            border: '1px solid #ebcb4c',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          ¡2 meses gratis!
        </span>
      )}
    </div>
  )
}
