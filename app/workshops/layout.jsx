import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-workshop',
})

export default function WorkshopLayout({ children }) {
  return <div className={poppins.variable}>{children}</div>
}
