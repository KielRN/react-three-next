import Link from 'next/link'

export function FunnelHeader({ showCta = true }) {
  return (
    <header className='cgd-header'>
      <Link href='/' className='cgd-header-brand'>
        TEXAS AI ▸ CHATGPT DEPLOYMENT
      </Link>
      {showCta && (
        <Link href='/funnels/chatgpt-deployment/book' className='cgd-header-cta'>
          Book a call
        </Link>
      )}
    </header>
  )
}

export function FunnelFooter() {
  return (
    <footer className='cgd-footer'>
      <p style={{ margin: '0 0 8px' }}>
        © {new Date().getFullYear()} Texas AI Consulting · Veteran-owned · San Antonio, Texas
      </p>
      <p style={{ margin: 0 }}>
        <Link href='/privacy-policy'>Privacy Policy</Link>
        <Link href='/terms-of-use'>Terms of Use</Link>
      </p>
    </footer>
  )
}
