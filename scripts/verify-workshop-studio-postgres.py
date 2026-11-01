"""Own an isolated loopback PostgreSQL cluster; never use project DATABASE_URL.

Run from react-three-next: python scripts/verify-workshop-studio-postgres.py
Requires PostgreSQL binaries locally (PG_BIN override, otherwise installed17).
No provider/production/GHL calls, user credentials, billing or learner provisioning.
"""
from pathlib import Path
from datetime import datetime, timezone
import json
import os
import secrets
import socket
import subprocess
import sys
import uuid

app = Path.cwd().resolve()
assert (app / 'package.json').is_file() and (app / 'tests/workshopStudioPostgres.integration.test.js').is_file(), 'Run from the Next app root'
base = (app / '.tmp/workshop-studio/postgres-concurrency').resolve()
base.mkdir(parents=True, exist_ok=True)
run = (base / uuid.uuid4().hex).resolve()
assert run.is_relative_to(base)
run.mkdir()
data = (run / 'data').resolve()
assert data.is_relative_to(base) and not data.exists()
binary = Path(os.environ.get('PG_BIN', 'C:/Program Files/PostgreSQL/17/bin'))
for name in ['initdb.exe','pg_ctl.exe']:
    assert (binary / name).is_file(), 'Install PostgreSQL binaries or supply PG_BIN; no existing server will be used'
with socket.socket() as probe:
    probe.bind(('127.0.0.1',0))
    port = probe.getsockname()[1]
password = secrets.token_urlsafe(32)
pwfile = run / 'init-password.txt'
pwfile.write_text(password, encoding='utf-8')
marker = {'purpose':'txai-studio-isolated-concurrency-acceptance','dataDirectory':str(data),'port':port,'createdAt':datetime.now(timezone.utc).isoformat()}
(run/'owned-cluster.json').write_text(json.dumps(marker,indent=2), encoding='utf-8')
flags = subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
def command(args, timeout=60):
    # Do not PIPE daemon startup: on Windows a descendant can inherit the pipe
    # and keep communicate() waiting after pg_ctl itself has already exited.
    with (run/'cluster.log').open('a',encoding='utf-8') as log:
        result = subprocess.run([str(arg) for arg in args],cwd=app,stdout=log,stderr=subprocess.STDOUT,timeout=timeout,creationflags=flags)
    if result.returncode: raise RuntimeError('Isolated PostgreSQL command failed; inspect private cluster.log (no provider credentials used)')
start_attempted = False
test_code = 1
try:
    command([binary/'initdb.exe','-D',data,'-U','studio_test','--auth-host=scram-sha-256','--auth-local=scram-sha-256','--pwfile',pwfile,'--no-locale','-E','UTF8'])
    start_attempted = True
    command([binary/'pg_ctl.exe','-D',data,'-l',run/'server.log','-o',f'-h 127.0.0.1 -p {port}','-w','start'])
    environment = os.environ.copy()
    environment['TXAI_STUDIO_TEST_PG_URL'] = f'postgresql://studio_test:{password}@127.0.0.1:{port}/postgres'
    environment['TXAI_STUDIO_TEST_PG_DIR'] = str(data)
    environment['TXAI_STUDIO_TEST_PG_MARKER'] = str(run/'owned-cluster.json')
    # No shell, no project .env loader and no real database URL passed to tests.
    with (run/'tests.log').open('w',encoding='utf-8') as log:
        tests = subprocess.run(['node','node_modules/vitest/vitest.mjs','run','tests/workshopStudioPostgres.integration.test.js','--reporter=json','--outputFile='+str(run/'vitest.json')],cwd=app,env=environment,stdout=log,stderr=subprocess.STDOUT,timeout=90,creationflags=flags)
    test_code = tests.returncode
finally:
    if start_attempted:
        # Stop ONLY this fresh owned data directory. No recursive removal or
        # Windows service operation; production/local user clusters untouched.
        assert data.resolve().is_relative_to(base) and json.loads((run/'owned-cluster.json').read_text())['dataDirectory'] == str(data)
        with (run/'cluster.log').open('a',encoding='utf-8') as log:
            status=subprocess.run([str(binary/'pg_ctl.exe'),'-D',str(data),'status'],cwd=app,stdout=log,stderr=subprocess.STDOUT,timeout=15,creationflags=flags)
        if status.returncode == 0:
            command([binary/'pg_ctl.exe','-D',data,'-m','fast','-w','stop'])
    pwfile.unlink(missing_ok=True)
summary = {'recordedAt':datetime.now(timezone.utc).isoformat(),'passed':test_code==0,'engine':'isolated local PostgreSQL17','multipleConnections':True,'providerCalls':0,'productionDatabaseTouched':False,'ownedDataDirectory':str(data),'clusterStopped':not (data/'postmaster.pid').exists(),'logs':str(run),'tests':None}
if (run/'vitest.json').is_file():
    report=json.loads((run/'vitest.json').read_text(encoding='utf-8'))
    summary['tests']={'passed':report.get('numPassedTests'),'failed':report.get('numFailedTests')}
(base/'latest-readback.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary))
sys.exit(test_code)
