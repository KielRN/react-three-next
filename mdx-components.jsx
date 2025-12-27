import Image from 'next/image'
import Link from 'next/link'
// import TypewriterText from './src/components/blog/TypewriterText'

export function useMDXComponents(components) {
  return {
    // Customize how built-in components are rendered
    // Use existing blog styling to maintain consistency
    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl font-bold text-[#2c75ff] font-hesdeadjim"
        style={{ textShadow: '0 0 10px rgba(44, 117, 255, 0.7)' }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-bold text-[#2c75ff] font-hesdeadjim"
        style={{ textShadow: '0 0 8px rgba(44, 117, 255, 0.7)' }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-bold text-[#2c75ff] font-hesdeadjim"
        style={{ textShadow: '0 0 6px rgba(44, 117, 255, 0.7)' }}>
        {children}
      </h3>
    ),
    a: ({ href, children }) => {
      const isInternal = href && !href.startsWith('http')
      if (isInternal) {
        return <Link href={href || '#'} className="text-[#2c75ff] hover:text-[#ffcc00] transition-colors duration-300">{children}</Link>
      }
      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#2c75ff] hover:text-[#ffcc00] transition-colors duration-300">{children}</a>
    },
    img: ({ src, alt }) => (
      <div className="my-8">
        <Image
          src={src || ''}
          alt={alt || ''}
          width={800}
          height={450}
          className="rounded-lg"
          style={{ objectFit: 'cover' }}
        />
      </div>
    ),
    p: ({ children }) => (
      <p className="text-white mb-4">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="text-white list-disc ml-6 mb-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="text-white list-decimal ml-6 mb-4">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-white mb-2">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#ffcc00] pl-4 py-2 my-4 bg-[#0e2042]/40 rounded-r-lg text-white">{children}</blockquote>
    ),
    // Custom components available in MDX
    // TypewriterText,
    // Keep all other components as is
    ...components,
  }
}