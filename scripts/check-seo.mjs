import assert from 'node:assert/strict'

// Check the actual HTTP responses, locally or after deployment.
const base = process.argv[2] || 'http://localhost:3105'
const canonicalOrigin = 'https://texasaiconsulting.com'
let failures = 0

function tagAttributes(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'gi'))].map(([markup]) =>
    Object.fromEntries([...markup.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value])),
  )
}

async function check(path, verify) {
  try {
    const response = await fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(60000) })
    const html = await response.text()
    await verify(response, html)
    console.log(`PASS ${path}`)
  } catch (error) {
    failures++
    console.error(`FAIL ${path}: ${error.message}`)
  }
}

const canonicalPages = [
  ['/', '/'],
  ['/blog', '/blog'],
  ['/blog?tag=pricing', '/blog'],
  ['/blog?search=%7Bsearch_term_string%7D', '/blog'],
  ['/blog/central-texas-data-centers-2025', '/blog/central-texas-data-centers-2025'],
  ['/blog/smart-site-plan-99-per-month', '/blog/smart-site-plan-99-per-month'],
  ['/apps', '/apps'],
  ['/portfolio', '/portfolio'],
  ['/apps/roi-calculator', '/apps/roi-calculator'],
  ['/apps/central-texas-data-centers?chart=forecast', '/apps/central-texas-data-centers'],
]

// Sequential requests avoid overwhelming a development server compiling routes.
for (const [path, canonicalPath] of canonicalPages) {
  await check(path, (response, html) => {
    assert.equal(response.status, 200)
    const canonical = tagAttributes(html, 'link').filter((link) => link.rel === 'canonical')
    assert.equal(canonical.length, 1, 'expected exactly one canonical link')
    assert.equal(new URL(canonical[0].href).href, new URL(canonicalPath, canonicalOrigin).href)
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1] || ''
    assert.equal((title.match(/Texas AI Consulting/g) || []).length, 1, 'brand should appear once in the title')
    const meta = tagAttributes(html, 'meta')
    const robots = meta.find((tag) => tag.name === 'robots')?.content || ''
    if (path.startsWith('/blog?')) {
      assert.match(robots, /noindex/)
      assert.doesNotMatch(robots, /nofollow/)
      assert.ok(!meta.some((tag) => tag.name === 'googlebot' && /^index(?:,|$)/.test(tag.content)))
    } else {
      assert.doesNotMatch(robots, /noindex/)
    }
    if (path === '/') {
      assert.match(title, /San Antonio/)
      assert.ok(!meta.some((tag) => tag.name === 'google-site-verification' && tag.content.startsWith('G-')))
      assert.ok(html.includes('G-S46TGFXZQF'), 'existing analytics tag must remain')
      assert.ok(!html.includes('+1-210-555-0100'), 'placeholder business phone must not be published')
      assert.ok(!html.includes('search_term_string'), 'unsupported structured search action must not be published')
    }
    if (path === '/blog') {
      const ogUrl = meta.find((tag) => tag.property === 'og:url')?.content
      assert.equal(ogUrl, `${canonicalOrigin}/blog`)
    }
  })
}

for (const query of ['', '?chart=market-capacity', '?chart=regional-comparison', '?chart=market-segmentation', '?chart=forecast']) {
  await check(`/data-dashboard${query}`, (response) => {
    assert.equal(response.status, 308, 'legacy URLs need a permanent redirect')
    const location = new URL(response.headers.get('location'), base)
    assert.equal(location.pathname, '/apps/central-texas-data-centers')
    assert.equal(location.search, query, 'chart selection must survive the redirect')
  })
}

await check('/robots.txt', (response, text) => {
  assert.equal(response.status, 200)
  assert.match(text, /Disallow: \/admin\//)
  assert.match(text, /Disallow: \/api\//)
  assert.doesNotMatch(text, /Disallow: \/_next\//)
  assert.doesNotMatch(text, /User-agent: (?:Googlebot|Bingbot)/)
  assert.ok(text.includes(`${canonicalOrigin}/sitemap.xml`))
})

await check('/blog/central-texas-data-centers-2025', (response, html) => {
  assert.equal(response.status, 200)
  assert.ok(!html.includes('href="/data-dashboard'), 'article must link directly to the current dashboard')
})

console.log(`SEO response checks: ${failures ? `${failures} failed` : 'all passed'}`)
process.exitCode = failures ? 1 : 0
