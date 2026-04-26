'use client'

export default function FunnelHeader({ currentStep = 1, totalSteps = 3 }) {
  const steps = [
    { num: 1, label: 'Review' },
    { num: 2, label: 'Agreement' },
    { num: 3, label: 'Activate' },
  ]

  return (
    <header style={{
      padding: '20px 0',
      borderBottom: '1px solid rgba(235, 203, 76, 0.2)',
      marginBottom: '0',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{
            fontFamily: "'Arial Black', sans-serif",
            fontWeight: 900,
            fontStyle: 'italic',
            fontSize: '20px',
            color: '#ebcb4c',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}>
            TEXAS AI CONSULTING
          </span>
        </div>

        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0',
        }}>
          {steps.slice(0, totalSteps).map((step, idx) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: step.num <= currentStep ? 1 : 0.4,
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  fontFamily: "'Space Mono', monospace",
                  background: step.num < currentStep
                    ? '#ebcb4c'
                    : step.num === currentStep
                      ? '#2c75ff'
                      : 'transparent',
                  color: step.num <= currentStep ? '#000' : '#666',
                  border: step.num <= currentStep
                    ? 'none'
                    : '2px solid #444',
                }}>
                  {step.num < currentStep ? '✓' : step.num}
                </div>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  color: step.num === currentStep ? '#ffffff' : '#888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {step.label}
                </span>
              </div>
              {idx < totalSteps - 1 && (
                <div style={{
                  width: '60px',
                  height: '2px',
                  background: step.num < currentStep
                    ? '#ebcb4c'
                    : '#333',
                  margin: '0 12px',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
