'use client'

import { STRIPE_CONFIG } from '../stripe-config'

export default function PricingCards({ selected, onSelect, variant = 'dark' }) {
  const { display } = STRIPE_CONFIG
  const isDark = variant === 'dark'

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {/* Monthly Option */}
      <div
        className={`pricing-option monthly ${selected === 'monthly' ? 'selected' : ''}`}
        onClick={() => onSelect('monthly')}
        style={{
          flex: '1',
          minWidth: '280px',
          maxWidth: '400px',
          background: isDark
            ? selected === 'monthly' ? 'rgba(44,117, 255, 0.1)' : '#1a1a1a'
            : selected === 'monthly' ? '#f0f4ff' : '#f8fafc',
          border: selected === 'monthly'
            ? '2px solid #2c75ff'
            : isDark ? '2px solid #333' : '2px solid #d0d0d0',
          padding: '24px',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span className="pricing-badge blue" style={{
            background: '#2c75ff', color: 'white', padding: '4px 12px',
            borderRadius: '3px', fontSize: '11px', fontWeight: 'bold',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            MONTHLY
          </span>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            border: selected === 'monthly' ? '6px solid #2c75ff' : '2px solid #666',
            background: selected === 'monthly' ? 'white' : 'transparent',
          }} />
        </div>
        <div style={{
          fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontStyle: 'italic',
          fontSize: '32px', color: isDark ? '#fff' : '#111', marginBottom: '4px',
        }}>
          {display.monthly.price}
        </div>
        <div style={{ fontSize: '14px', color: isDark ? '#aaa' : '#666', marginBottom: '12px' }}>
          + {display.monthly.setupFee} one-time setup fee
        </div>
        <div style={{
          borderTop: isDark ? '1px solid #333' : '1px solid #e0e0e0',
          paddingTop: '12px', fontSize: '13px', color: isDark ? '#888' : '#777',
        }}>
          First payment: <strong style={{ color: isDark ? '#fff' : '#111' }}>{display.monthly.firstPayment}</strong>
          <br />
          12-month total: {display.monthly.yearTotal}
        </div>
      </div>

      {/* Annual Option */}
      <div
        className={`pricing-option annual ${selected === 'annual' ? 'selected' : ''}`}
        onClick={() => onSelect('annual')}
        style={{
          flex: '1',
          minWidth: '280px',
          maxWidth: '400px',
          background: isDark
            ? selected === 'annual' ? 'rgba(235, 203, 76, 0.08)' : '#1a1a1a'
            : selected === 'annual' ? '#fffbeb' : '#fffbeb',
          border: selected === 'annual'
            ? '2px solid #ebcb4c'
            : isDark ? '2px solid #333' : '2px solid #d0d0d0',
          padding: '24px',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
      >
        {/* Best Value Badge */}
        <div style={{
          position: 'absolute', top: '-12px', right: '20px',
          background: '#ebcb4c', color: '#1a1a1a', padding: '4px 14px',
          fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase',
          letterSpacing: '0.5px', borderRadius: '3px',
        }}>
          ★ BEST VALUE — SAVE {display.annual.savings}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span className="pricing-badge gold" style={{
            background: '#ebcb4c', color: '#1a1a1a', padding: '4px 12px',
            borderRadius: '3px', fontSize: '11px', fontWeight: 'bold',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            ANNUAL
          </span>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            border: selected === 'annual' ? '6px solid #ebcb4c' : '2px solid #666',
            background: selected === 'annual' ? 'white' : 'transparent',
          }} />
        </div>
        <div style={{
          fontFamily: "'Arial Black', sans-serif", fontWeight: 900, fontStyle: 'italic',
          fontSize: '32px', color: isDark ? '#fff' : '#111', marginBottom: '4px',
        }}>
          {display.annual.price}
        </div>
        <div style={{ fontSize: '14px', color: '#ebcb4c', fontWeight: 'bold', marginBottom: '12px' }}>
          Setup fee WAIVED ✓
        </div>
        <div style={{
          borderTop: isDark ? '1px solid #333' : '1px solid #e0e0e0',
          paddingTop: '12px', fontSize: '13px', color: isDark ? '#888' : '#777',
        }}>
          One payment: <strong style={{ color: isDark ? '#fff' : '#111' }}>{display.annual.firstPayment}</strong>
          <br />
          That&apos;s only $97/mo — no surprises
        </div>
      </div>
    </div>
  )
}
