import Image from 'next/image'

const LOGO_DIR = '/img/funnels/reviews/as-seen-on'

// width/height are each PNG's intrinsic size; h is the rendered height in px.
const NETWORKS = [
  { name: 'NBC', file: 'nbc.png', width: 342, height: 336, h: 56 },
  { name: 'CBS News', file: 'cbs-news.png', width: 432, height: 285, h: 48 },
  { name: 'ABC', file: 'abc.png', width: 336, height: 336, h: 56 },
  { name: 'FOX', file: 'fox.png', width: 417, height: 189, h: 32 },
]

export default function AsSeenOn() {
  return (
    <section style={{ padding: '0 24px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#0e2042',
            marginBottom: '20px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Como se vio en
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px clamp(16px, 4.5vw, 56px)',
            flexWrap: 'wrap',
          }}
        >
          {NETWORKS.map((n) => (
            <Image
              key={n.file}
              src={`${LOGO_DIR}/${n.file}`}
              alt={n.name}
              width={n.width}
              height={n.height}
              style={{ height: `${n.h}px`, width: 'auto' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
