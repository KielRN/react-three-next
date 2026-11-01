"""Run against the local built app on port3104; isolated synthetic browser data only."""
import asyncio, json, subprocess, socket, os, sys, time
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
job_id = '11111111-1111-4111-8111-111111111111'
jobs = {'jobs':[{'id':job_id,'state':'submitted','providerState':'completed','maximumCostCents':472,'actualCostCents':None,'downloadReady':True,'output':{'byteCount':256,'expiresAt':'2026-11-13T19:00:00Z'}}]}

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
        for path in ['/api/workshop-studio/jobs','/api/workshop-studio/jobs/'+job_id+'/download']:
            closed = await context.request.get(base + path)
            assert closed.status == 503 and 'no-store' in closed.headers.get('cache-control','')
        results['nativeClosedOutputEndpoints'] = True
        ranged = await context.request.get(base + '/api/workshop-studio/jobs/'+job_id+'/download',headers={'Range':'bytes=0-10'})
        assert ranged.status == 400 and 'no-store' in ranged.headers.get('cache-control','')
        results['nativeRangeDownloadGuard'] = True
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
        pending_delete = []
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
            elif route.request.method == 'DELETE':
                pending_delete.append(route)
            else:
                await route.fulfill(status=200, json={'authenticated': route.request.method == 'POST'})
        await page.route(base + '/api/workshop-studio/session', api)
        job_gets = 0
        pending_jobs = []
        async def job_api(route):
            nonlocal job_gets
            job_gets += 1
            if job_gets == 1:
                await route.fulfill(status=200, json=jobs)
            else:
                pending_jobs.append(route)
        await page.route(base + '/api/workshop-studio/jobs', job_api)
        await page.goto(base + '/workshops/studio')
        await page.wait_for_timeout(150)
        await page.locator('#access-code').fill('a'*43)
        await page.get_by_role('button', name='Open my studio').click()
        await page.locator('#allowance').wait_for(state='visible')
        assert await page.locator('#available').inner_text() == '$3.50'
        assert await page.get_by_role('button', name='Generation unavailable').is_disabled()
        results['mockAllowanceRendering'] = True
        await page.get_by_role('link', name='Download video 1').wait_for()
        assert await page.get_by_role('link', name='Download video 1').get_attribute('href') == '/api/workshop-studio/jobs/' + job_id + '/download'
        assert await page.locator('#results').is_visible()
        assert await page.evaluate('() => document.documentElement.scrollWidth <= innerWidth')
        results['mockPrivateResultRendering'] = True
        await page.screenshot(path=str(out / 'page-mocked-allowance.png'), full_page=True)
        await page.get_by_role('button', name='Refresh videos').click()
        await page.wait_for_timeout(100)
        assert pending_jobs
        await page.get_by_role('button', name='Refresh videos').click()
        await page.wait_for_timeout(100)
        assert len(pending_jobs) == 2
        unknown_jobs={'jobs':[{'id':job_id,'state':'unknown','providerState':None,'maximumCostCents':472,'actualCostCents':None,'downloadReady':False,'output':None}]}
        await pending_jobs[1].fulfill(status=200, json=unknown_jobs)
        await page.wait_for_timeout(100)
        assert await page.get_by_text('Request outcome is not confirmed. Please contact your instructor.',exact=True).is_visible(),'Unknown submission was described as confirmed progress'
        results['unknownSubmissionIsNotClaimedAsProgress']=True
        await pending_jobs[0].fulfill(status=200, json=jobs)
        await page.wait_for_timeout(100)
        results['olderRefreshCannotRestoreReplacedResults'] = await page.locator('#result-list a').count() == 0
        assert results['olderRefreshCannotRestoreReplacedResults']
        await page.get_by_role('button', name='Refresh videos').click()
        await page.wait_for_timeout(100)
        await page.get_by_role('button', name='Sign out').click()
        await page.wait_for_timeout(75)
        assert not await page.locator('#allowance').is_visible(),'A pending sign-out left private allowance visible'
        assert not await page.locator('#results').is_visible(),'A pending sign-out left private result links visible'
        results['signOutClearsViewBeforeServerReply'] = True
        assert pending_delete
        await pending_delete[0].fulfill(status=200,json={'authenticated':False})
        await page.locator('#allowance').wait_for(state='hidden')
        await pending[0].fulfill(status=200, json=usage)
        await pending_jobs[-1].fulfill(status=200, json=jobs)
        await page.wait_for_timeout(150)
        results['lateResponseCannotRestoreSignedOutData'] = not await page.locator('#allowance').is_visible()
        results['noBrowserStorage'] = await page.evaluate('() => localStorage.length === 0 && sessionStorage.length === 0')
        assert results['lateResponseCannotRestoreSignedOutData'], 'Late pre-login response restored data after logout'
        results['lateResultsCannotRestoreSignedOutLinks'] = not await page.locator('#results').is_visible() and await page.locator('#result-list a').count() == 0
        assert results['lateResultsCannotRestoreSignedOutLinks']
        assert results['noBrowserStorage']
        await context.close()

        # A stale POST still applies Set-Cookie even if its JS render is ignored.
        # Keep session mutations serialized across visibility invalidation and
        # broadcast actual cookie changes before suppressing stale rendering.
        context = await browser.new_context(service_workers='block')
        page = await context.new_page()
        await page.route(base + '/workshops/studio', document)
        mutations = []
        authenticated = False
        new_usage = {**usage, 'seat':{'availableCents':200,'heldCents':0,'spentCents':300}}
        async def mutation_api(route):
            nonlocal authenticated
            if route.request.method == 'GET':
                await route.fulfill(status=200 if authenticated else 401, json=new_usage if authenticated else {'error':'Not signed in'})
            elif route.request.method == 'POST':
                mutations.append(route)
                if len(mutations) > 1:
                    authenticated = True
                    await route.fulfill(status=200, json={'authenticated':True}, headers={'Set-Cookie':'fixture_session=newer; Path=/'})
            else:
                authenticated = False
                await route.fulfill(status=200, json={'authenticated':False})
        await page.route(base + '/api/workshop-studio/session', mutation_api)
        await page.route(base + '/api/workshop-studio/jobs', lambda route: route.fulfill(status=200,json={'jobs':[]}))
        await page.goto(base + '/workshops/studio',wait_until='networkidle')
        await page.evaluate("() => { window.__cookieNotices=0;window.__observer=new BroadcastChannel('txai-workshop-view');window.__observer.onmessage=()=>window.__cookieNotices++ }")
        await page.locator('#access-code').fill('b'*43)
        await page.get_by_role('button',name='Open my studio').click()
        await page.wait_for_timeout(75)
        assert len(mutations)==1
        await page.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))")
        await page.locator('#access-code').fill('c'*43)
        await page.locator('#access-form').evaluate("form => form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))")
        await page.wait_for_timeout(75)
        assert len(mutations)==1,'Visibility change allowed overlapping cookie-changing login requests'
        await mutations[0].fulfill(status=200,json={'authenticated':True},headers={'Set-Cookie':'fixture_session=older; Path=/'})
        await page.wait_for_timeout(100)
        assert await page.evaluate('() => window.__cookieNotices > 0'),'Stale successful login did not broadcast its cookie change'
        assert not await page.locator('#allowance').is_visible()
        assert await page.get_by_role('button',name='Open my studio').is_enabled()
        await page.locator('#access-code').fill('c'*43)
        await page.get_by_role('button',name='Open my studio').click()
        await page.locator('#allowance').wait_for(state='visible')
        assert await page.locator('#available').inner_text()=='$2.00'
        assert next(c for c in await context.cookies() if c['name']=='fixture_session')['value']=='newer'
        results['serializedSessionMutationsAcrossVisibility']=True
        results['staleLoginCookieChangeBroadcastAndReconciliation']=True
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

if '--with-server' in sys.argv:
    # Direct owned child: the shared shell-based helper leaves a Windows node
    # descendant listening after terminating its command-shell parent.
    with socket.socket() as probe:
        probe.bind(('127.0.0.1',3104))
    with (out/'page-preview-server.log').open('w',encoding='utf-8') as log:
        server=subprocess.Popen(['node','node_modules/next/dist/bin/next','start','-p','3104'],cwd=repo,stdout=log,stderr=subprocess.STDOUT,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
        try:
            deadline=time.monotonic()+30
            while True:
                if server.poll() is not None:raise RuntimeError('Owned preview exited before readiness')
                with socket.socket() as probe:
                    ready=probe.connect_ex(('127.0.0.1',3104))==0
                if ready:break
                if time.monotonic()>=deadline:raise RuntimeError('Owned preview did not become ready')
                time.sleep(.1)
            asyncio.run(main())
        finally:
            server.terminate()
            try:server.wait(timeout=5)
            except subprocess.TimeoutExpired:server.kill();server.wait(timeout=5)
            with socket.socket() as probe:
                assert probe.connect_ex(('127.0.0.1',3104))!=0,'Owned preview is still listening'
            print(json.dumps({'ownedPreviewPid':server.pid,'ownedPreviewStopped':True}))
else:
    asyncio.run(main())
