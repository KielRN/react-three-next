import Image from 'next/image'

const LOGO_DIR = '/img/funnels/reviews/logos'

// width/height are each file's intrinsic size; h is the rendered height in px.
const LOGOS = [
  { name: 'Groundworks Construction LLC', file: 'groundworks-construction.png', width: 487, height: 320, h: 100 },
  { name: 'Brisa Limpia Cleaning Co.', file: 'brisa-limpia-cleaning.svg', width: 1824, height: 1006, h: 80 },
  { name: 'Dos Llaves Auto Garage', file: 'dos-llaves-auto-garage.svg', width: 1010, height: 1009, h: 98 },
  { name: 'Kavah', file: 'kavah.png', width: 799, height: 218, h: 38 },
  { name: 'Tres Mesquites Lawn & Landscape', file: 'tres-mesquites-lawn-landscape.svg', width: 1421, height: 662, h: 72 },
  { name: 'Chachalaca Air & Heat', file: 'chachalaca-air-heat.svg', width: 1424, height: 688, h: 72 },
]

export default function TrustStrip() {
  return (
    <section
      style={{
        padding: '32px 24px',
        borderTop: '1px solid #eee',
        borderBottom: '1px solid #eee',
        background: '#fafafa',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', letterSpacing: '0.05em' }}>
          Negocios de Texas confían en nosotros
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            justifyItems: 'center',
            alignItems: 'center',
            gap: '28px 24px',
          }}
        >
          {LOGOS.map((logo) => (
            <Image
              key={logo.file}
              src={`${LOGO_DIR}/${logo.file}`}
              alt={logo.name}
              width={logo.width}
              height={logo.height}
              unoptimized={logo.file.endsWith('.svg')}
              style={{ height: `${logo.h}px`, width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
