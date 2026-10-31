"""Run against the local built app on port3104; isolated synthetic browser data only."""
import asyncio, json, subprocess
from pathlib import Path
from playwright.async_api import async_playwright

repo = Path(__file__).resolve().parents[1]
out = repo / '.tmp/workshop-studio'
out.mkdir(parents=True, exist_ok=True)
base = 'http://localhost:3104'
fixture = subprocess.run(['node', '--input-type=module', '-e',
    "import {studioDocument} from './lib/workshopStudioDocument.js';process.stdout.write(studioDocument(true))"],
    cwd=repo, capture_output=True, text=True, check=True, encoding='utf-8').stdout
usage = {'currency': 'USD', 'accessExpiresAt': '2026-11-13T19:00:00Z', 'seat': {'availableCents': 350, 'heldCents': 100, 'spentCents': 50}}

async def main():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel='chrome', headless=True)
        context = await browser.new_context(service_workers='block', viewport={'width':1440,'height':1000})
        external = []
        async def block_external(route):
            if not route.request.url.startswith(base):
                external.append(route.request.url)
                await route.abort()
            else:
                await route.continue_()
        await context.route('**/*', block_external)
        page = await context.new_page()
        response = await context.request.get(base + '/workshops/studio')
        assert response.status == 200 and 'no-store' in response.headers.get('cache-control', '')
        assert response.headers.get('referrer-policy') == 'no-referrer'
        assert "script-src 'self'" in response.headers.get('content-security-policy', '')
        assert 'name="code"' not in await response.text()
        flight = await context.request.get(base + '/workshops/studio?_rsc=probe', headers={'RSC':'1'})
        assert flight.status == 409 and 'text/plain' in flight.headers['content-type']
        results['nativePrivateHeadersAndDocumentFallback'] = True
        await page.goto(base + '/workshops', wait_until='networkidle')
        await page.evaluate("() => {window.__publicMarker='public'; const a=document.createElement('a');a.href='/workshops/studio';a.id='studio-entry';a.textContent='Studio';document.body.appendChild(a)}")
        await page.locator('#studio-entry').click()
        await page.wait_for_url(base + '/workshops/studio')
        await page.wait_for_load_state('networkidle')
        assert await page.title() == 'Workshop studio | Texas AI Consulting'
        results['freshDocumentBoundary'] = await page.evaluate("() => !window.__publicMarker && !window.gtag && !window.dataLayer")
        assert results['freshDocumentBoundary']
        assert await page.locator('#access-code').is_disabled()
        await page.screenshot(path=str(out / 'page-desktop.png'), full_page=True)
        external.clear()
        await page.set_viewport_size({'width':390,'height':844})
        await page.reload(wait_until='networkidle')
        results['mobileNoOverflow'] = await page.evaluate('() => document.documentElement.scrollWidth <= innerWidth')
        assert results['mobileNoOverflow']
        assert not external
        results['noExternalPrivateRequests'] = True
        await page.keyboard.press('Tab')
        results['keyboardSkipLink'] = await page.evaluate("() => document.activeElement.className === 'skip'")
        assert results['keyboardSkipLink']
        await page.screenshot(path=str(out / 'page-mobile.png'), full_page=True)
        await context.close()

        # Synthetic browser-only fixture; no real server sessions/codes are issued.
        context = await browser.new_context(service_workers='block', viewport={'width':390,'height':844})
        page = await context.new_page()
        pending = []
        gets = 0
        async def document(route):
            await route.fulfill(status=200, content_type='text/html', body=fixture,
                headers={'Referrer-Policy':'no-referrer', 'Cache-Control':'private, no-store'})
        await page.route(base + '/workshops/studio', document)
        async def api(route):
            nonlocal gets
            if route.request.method == 'GET':
                gets += 1
                if gets == 1:
                    pending.append(route)
                    return
                await route.fulfill(status=200, json=usage)
            else:
                await route.fulfill(status=200, json={'authenticated': route.request.method == 'POST'})
        await page.route(base + '/api/workshop-studio/session', api)
        await page.goto(base + '/workshops/studio')
        await page.wait_for_timeout(150)
        await page.locator('#access-code').fill('a'*43)
        await page.get_by_role('button', name='Open my studio').click()
        await page.locator('#allowance').wait_for(state='visible')
        assert await page.locator('#available').inner_text() == '$3.50'
        assert await page.get_by_role('button', name='Generation unavailable').is_disabled()
        results['mockAllowanceRendering'] = True
        await page.screenshot(path=str(out / 'page-mocked-allowance.png'), full_page=True)
        await page.get_by_role('button', name='Sign out').click()
        await page.locator('#allowance').wait_for(state='hidden')
        await pending[0].fulfill(status=200, json=usage)
        await page.wait_for_timeout(150)
        results['lateResponseCannotRestoreSignedOutData'] = not await page.locator('#allowance').is_visible()
        results['noBrowserStorage'] = await page.evaluate('() => localStorage.length === 0 && sessionStorage.length === 0')
        assert results['lateResponseCannotRestoreSignedOutData'], 'Late pre-login response restored data after logout'
        assert results['noBrowserStorage']
        await context.close()

        context = await browser.new_context(java_script_enabled=False, service_workers='block')
        page = await context.new_page()
        await page.route(base + '/workshops/studio', document)
        submitted = []
        async def no_script_api(route):
            submitted.append({'method': route.request.method, 'body': route.request.post_data or '', 'url': route.request.url})
            await route.fulfill(status=503, content_type='text/plain', body='Access unavailable')
        await page.route(base + '/api/workshop-studio/session', no_script_api)
        await page.goto(base + '/workshops/studio')
        await page.locator('#access-code').fill('a'*43)
        await page.get_by_role('button', name='Open my studio').click()
        assert submitted and submitted[0]['method'] == 'POST'
        assert 'a'*43 not in submitted[0]['body'] and '?' not in submitted[0]['url']
        results['noScriptFallbackDoesNotSendCode'] = True
        await context.close()
        (out / 'page-browser-checks.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
        await browser.close()
    print(json.dumps(results))

asyncio.run(main())
