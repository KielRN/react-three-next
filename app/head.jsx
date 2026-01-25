const title = 'Texas AI Consulting | AI Solutions for Small Business'
const url = 'https://texasaiconsulting.com'
const description = 'Big AI For Small Businesses in San Antonio, Austin and Central Texas. Transform your business with AI-powered sales, operations, and marketing automation.'
const author = 'Texas AI Consulting'
const twitter = '@texasaiconsulting'

export default function Head() {
  return (
    <>
      {/* Recommended Meta Tags */}
      <meta charSet='utf-8' />
      <meta name='language' content='english' />
      <meta httpEquiv='content-type' content='text/html' />
      <meta name='author' content={author} />
      <meta name='designer' content={author} />
      <meta name='publisher' content={author} />

      {/* Search Engine Optimization Meta Tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta
        name='keywords'
        content='AI consulting, artificial intelligence, small business AI, Texas AI, San Antonio AI, Austin AI, Central Texas, AI automation, sales automation, marketing automation, business intelligence, AI agents, machine learning, ChatGPT for business, AI integration'
      />
      <meta name='robots' content='index,follow' />
      <meta name='distribution' content='web' />
      <meta name='geo.region' content='US-TX' />
      <meta name='geo.placename' content='San Antonio, Austin' />

      {/*
      Facebook Open Graph meta tags
        documentation: https://developers.facebook.com/docs/sharing/opengraph */}
      <meta property='og:title' content={title} />
      <meta property='og:type' content='website' />
      <meta property='og:url' content={url} />
      <meta property='og:image' content={`${url}/img/Texas-AI-Consulting-ST-Logo-ICON.png`} />
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:site_name' content='Texas AI Consulting' />
      <meta property='og:description' content={description} />
      <meta property='og:locale' content='en_US' />

      <link rel='apple-touch-icon' href='/img/Favicon-New-Texas-AI-Logo.png' />
      <link rel='apple-touch-icon' sizes='16x16' href='/img/Favicon-New-Texas-AI-Logo.png' />
      <link rel='apple-touch-icon' sizes='32x32' href='/img/Favicon-New-Texas-AI-Logo.png' />
      <link rel='apple-touch-icon' sizes='180x180' href='/img/Favicon-New-Texas-AI-Logo.png' />
      <link rel='manifest' href='/manifest.json' />
      <link rel='mask-icon' color='#ebcb4c' href='/safari-pinned-tab.svg' />
      <link rel='apple-touch-startup-image' href='/startup.png' />

      {/* Meta Tags for HTML pages on Mobile */}
      <meta name='format-detection' content='telephone=yes' />
      <meta name='HandheldFriendly' content='true' />
      <meta name='viewport' content='width=device-width, minimum-scale=1, initial-scale=1.0' />
      <meta name='theme-color' content='#ebcb4c' />
      <link rel='shortcut icon' href='/img/Favicon-New-Texas-AI-Logo.png' />
      <link rel='icon' href='/img/Texas-AI-Consulting-ST-Logo-FAVICON.png' />

      {/*
      Twitter Card
        documentation: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content={twitter} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={`${url}/img/Texas-AI-Consulting-ST-Logo-ICON.png`} />
      <meta name='twitter:creator' content={twitter} />
    </>
  )
}
