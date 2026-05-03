export default function TestNoticeBanner() {
  return (
    <div
      style={{
        background: '#dc2626',
        color: '#fff',
        padding: '12px 20px',
        textAlign: 'center',
        fontFamily: "'Space Mono', monospace",
        fontSize: '13px',
        fontWeight: 'bold',
        letterSpacing: '0.5px',
        borderBottom: '2px solid #ebcb4c',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      ⚠️ TEST PAGE — NO ORDERS WILL BE FULFILLED THROUGH THIS PAGE. THIS IS A LIVE-STRIPE INTEGRATION TEST ONLY.
    </div>
  )
}
