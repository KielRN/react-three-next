"""Real installed Workbox workers on an isolated localhost fixture origin; no app gates/accounts/provider."""
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
import subprocess, threading, json, socket, sys, hashlib, tempfile
repo=Path(__file__).resolve().parents[1];out=repo/'.tmp/workshop-studio-sw';out.mkdir(parents=True,exist_ok=True)
legacy=Path(sys.argv[sys.argv.index('--legacy-dir')+1]) if '--legacy-dir' in sys.argv else out/'legacy'
assert (legacy/'sw.js').is_file(),'Supply a saved pre-studio sw.js/workbox directory with --legacy-dir before rebuilding'
base='http://127.0.0.1:3143';state={'stage':'legacy','api':0,'owner':'A','apiStatus':200}
fixture=subprocess.run(['node','--input-type=module','-e',"import {studioDocument} from './lib/workshopStudioDocument.js';process.stdout.write(studioDocument(true))"],cwd=repo,capture_output=True,text=True,encoding='utf-8',check=True).stdout
class Handler(BaseHTTPRequestHandler):
 protocol_version='HTTP/1.1'
 def log_message(self,*args):pass
 def do_POST(self):
  state['api']+=1
  self.rfile.read(int(self.headers.get('Content-Length','0')))
  self.send_response(503);self.send_header('Content-Length','0');self.end_headers()
 def do_DELETE(self):self.do_POST()
 def do_GET(self):
  path=urlsplit(self.path).path;status=200;mime='text/html';headers={};body=b'<!doctype html><title>Isolated worker fixture</title><p>Worker fixture</p>'
  if path=='/sw.js':
   body=((legacy/'sw.js') if state['stage']=='legacy' else repo/'public/sw.js').read_bytes();mime='text/javascript';headers['Service-Worker-Allowed']='/'
  elif path.startswith('/workbox-'):
   p=(legacy/path[1:]);body=(p if p.exists() else repo/'public'/path[1:]).read_bytes();mime='text/javascript'
  elif path=='/workshops/studio':
   body=fixture.encode();headers={'Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; worker-src 'none'; form-action 'self'"}
  elif path.startswith('/api/workshop-studio') or path.startswith('/api/workshop%2D'):
   state['api']+=1;status=state['apiStatus'];mime='application/json';headers['Cache-Control']='private, no-store'
   body=json.dumps({'owner':state['owner'],'currency':'USD','accessExpiresAt':'2026-12-11T19:00:00Z','seat':{'availableCents':500,'heldCents':0,'spentCents':0}} if path.endswith('session') else {'jobs':[],'owner':state['owner']}).encode()
  elif path.startswith('/workshop-studio/'):
   p=repo/'public'/path[1:]
   if p.exists():
    body=(subprocess.run(['git','show','946ab1a:public/workshop-studio/studio.js'],cwd=repo,capture_output=True,check=True).stdout if '--red-baseline' in sys.argv and path.endswith('/studio.js') else p.read_bytes());mime='text/javascript' if p.suffix=='.js' else 'text/css'
   else:body=b'/* fixture */';mime='text/javascript'
  elif path.endswith('.js'):body=b'/* inert precache fixture */';mime='text/javascript'
  elif path.endswith('.css'):body=b'/* inert precache fixture */';mime='text/css'
  self.send_response(status);self.send_header('Content-Type',mime);self.send_header('Cache-Control',headers.pop('Cache-Control','no-cache'))
  for k,v in headers.items():self.send_header(k,v)
  self.send_header('Content-Length',str(len(body)));self.end_headers()
  try:self.wfile.write(body)
  except (BrokenPipeError,ConnectionResetError):pass

def entries(page):
 return page.evaluate("""async()=>{const out=[];for(const name of await caches.keys()){const c=await caches.open(name);for(const r of await c.keys())if(decodeURIComponent(new URL(r.url).pathname).startsWith('/api/workshop-studio')||decodeURIComponent(new URL(r.url).pathname).startsWith('/workshops/studio'))out.push({name,url:r.url})}return out}""")

def register(page):
 page.goto(base+'/harness',wait_until='networkidle');page.evaluate("async()=>await Promise.race([(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready})(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Worker install/ready timed out')),45000))])");page.wait_for_function('navigator.serviceWorker.controller !== null')

with socket.socket() as sock:assert sock.connect_ex(('127.0.0.1',3143))!=0,'Port occupied'
ThreadingHTTPServer.request_queue_size=128
server=ThreadingHTTPServer(('127.0.0.1',3143),Handler);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
results={};failure=None
profileOwner=tempfile.TemporaryDirectory(prefix='profile-',dir=out)
profile=Path(profileOwner.name).resolve();assert profile.parent==out.resolve();(profile/'.txai-owned-test').write_text('synthetic worker profile only')
try:
 with sync_playwright() as pw:
  context=pw.chromium.launch_persistent_context(str(profile),headless=True,service_workers='allow');page=context.new_page();page.set_default_timeout(15000);page.on('pageerror',lambda e:print('PAGE ERROR',str(e),flush=True))
  register(page)
  # Legacy controller really caches private no-store responses; reproduce with synthetic data only.
  assert page.evaluate("async()=> (await fetch('/api/workshop-studio/session')).ok")
  page.wait_for_function("async()=>{for(const n of await caches.keys())if(await(await caches.open(n)).match('/api/workshop-studio/session'))return true;return false}")
  results['legacyNoStoreStillCached']=bool(entries(page))
  page.evaluate("async()=>{const c=await caches.open('txai-migration-fixture');await c.put('/public-keep',new Response('public'));await c.put('/api/workshop%2Dstudio/jobs?fixture=1',new Response('synthetic-old-owner'))}")
  context.close()
  context=pw.chromium.launch_persistent_context(str(profile),headless=True,service_workers='allow');page=context.new_page();page.set_default_timeout(15000)
  page.goto(base+'/harness',wait_until='networkidle');assert entries(page),'Installed profile lost its legacy cache fixture'
  results['legacyCacheAndWorkerSurviveBrowserRestart']=True
  oldClient=subprocess.run(['git','show','946ab1a:public/workshop-studio/studio.js'],cwd=repo,capture_output=True,check=True).stdout.decode()
  page.evaluate("async source=>{await(await caches.open('static-js-assets')).put('/workshop-studio/studio.js',new Response(source,{headers:{'Content-Type':'text/javascript'}}))}",oldClient)
  before=state['api'];page.goto(base+'/workshops/studio',wait_until='networkidle');page.wait_for_timeout(2700)
  assert state['api']==before,'Unverified legacy worker received private session/jobs requests'
  assert page.locator('#allowance').is_hidden(),'Legacy controller exposed synthetic allowance'
  page.locator('#access-code').fill('a'*43)
  page.locator('#access-form').evaluate("form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))")
  page.wait_for_timeout(1800)
  assert state['api']==before,'Legacy controller received a code exchange' 
  page.evaluate("()=>{const a=document.createElement('a');a.className='download';a.href='/api/workshop-studio/jobs/11111111-1111-4111-8111-111111111111/download';a.textContent='Synthetic download';document.querySelector('#result-list').append(a);a.click()}")
  page.wait_for_timeout(1800)
  assert state['api']==before,'Legacy controller received a download request'
  results['versionedBootstrapBypassesLegacyScriptCache']=True
  results['legacyControllerFailsClosedBeforePrivateFetch']=True
  if '--legacy-only' not in sys.argv:
   state['stage']='current';page.evaluate("async()=>{await(await navigator.serviceWorker.getRegistration()).update()}")
   page.wait_for_function("async()=>{const c=navigator.serviceWorker.controller;if(!c)return false;return await new Promise(resolve=>{const m=new MessageChannel();const t=setTimeout(()=>resolve(false),300);m.port1.onmessage=e=>{clearTimeout(t);resolve(e.data?.type==='TXAI_STUDIO_CACHE_READY'&&e.data?.version===1&&e.data?.safe===true)};c.postMessage({type:'TXAI_STUDIO_CACHE_GUARD',version:1},[m.port2])})}",timeout=30000)
   page.locator('#allowance').wait_for(state='visible',timeout=15000)
   results['realGeneratedUpgradeTakesControlAndUnlocksFixtureView']=True
   assert not entries(page),'Old private cache entries survived upgraded worker'
   assert page.evaluate("async()=>await(await(await caches.open('txai-migration-fixture')).match('/public-keep')).text()")=='public'
   results['privateOnlyMigrationPreservesPublicCache']=True
   for path in ['/api/workshop-studio/session','/api/workshop-studio/jobs','/api/workshop-studio/jobs/11111111-1111-4111-8111-111111111111/download','/api/workshop%2Dstudio/session','/workshops/%73tudio','/api/workshop-studio%2F..%2Fsession']:
    page.evaluate('(path)=>fetch(path).then(r=>r.text())',path)
   assert not entries(page)
   for status in [401,503]:
    state['apiStatus']=status;page.evaluate("()=>fetch('/api/workshop-studio/session').then(r=>r.text())");assert not entries(page)
   state['apiStatus']=200
   state['owner']='B'
   assert page.evaluate("()=>fetch('/api/workshop-studio/session').then(r=>r.json()).then(d=>d.owner)")=='B'
   assert not entries(page)
   results['nextSyntheticLearnerSeesOnlyCurrentNetworkResponse']=True
   results['privateSuccessErrorsAliasesAndDownloadStayUncached']=True
   context.set_offline(True)
   assert page.evaluate("()=>fetch('/api/workshop-studio/session').then(()=>false,()=>true)")
   assert page.evaluate("()=>fetch('/api/workshop-studio/jobs/11111111-1111-4111-8111-111111111111/download').then(()=>false,()=>true)")
   assert page.evaluate("()=>fetch('/workshops/studio').then(()=>false,()=>true)")
   results['offlineHasNoPreviousLearnerFallback']=True
   context.set_offline(False)
   # A repeated safe acknowledgment must await deletion of newly seeded stale entries.
   page.evaluate("async()=>{const c=await caches.open('txai-migration-fixture');await c.put('/api/workshop-studio/session',new Response('synthetic-only'))}")
   assert page.evaluate("async()=>{const c=navigator.serviceWorker.controller;return await new Promise(resolve=>{const m=new MessageChannel();m.port1.onmessage=e=>resolve(e.data.safe===true);c.postMessage({type:'TXAI_STUDIO_CACHE_GUARD',version:1},[m.port2])})}")
   assert not entries(page)
   results['acknowledgmentWaitsForPurge']=True
   before=state['api'];state['stage']='legacy'
   page.evaluate("async()=>await(await navigator.serviceWorker.getRegistration()).update()")
   page.get_by_text('Your browser needs a privacy update. Reconnect and reload this page before opening the studio.',exact=True).wait_for(timeout=30000)
   assert page.locator('#allowance').is_hidden() and state['api']==before
   results['controllerRollbackClearsPrivateViewAndBlocksRequests']=True
  context.close()
except Exception as exc:
 failure=str(exc);raise
finally:
 server.shutdown();server.server_close();thread.join(timeout=5)
 assert profile.parent==out.resolve() and (profile/'.txai-owned-test').is_file()
 profileOwner.cleanup()
 with socket.socket() as sock:assert sock.connect_ex(('127.0.0.1',3143))!=0,'Owned fixture server still running'
 receipt={'results':results,'failure':failure,'isolatedFixtureOnly':True,'realLearnerAccessIssued':False,'realProviderCalls':0,'serverStopped':True,'ownedProfileRemoved':not profile.exists(),'legacyWorkerSHA256':hashlib.sha256((legacy/'sw.js').read_bytes()).hexdigest()}
 (out/('red.json' if '--red-baseline' in sys.argv else 'checks.json')).write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8');print(json.dumps(receipt))
