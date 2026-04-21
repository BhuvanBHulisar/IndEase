import { spawn } from 'child_process';
import * as readline from 'readline';
import { existsSync } from 'fs';
import { resolve } from 'path';

const SERVICES = {
  server: { name: 'Server', dir: 'server', port: 5000, required: true, color: '\x1b[36m' },
  main: { name: 'Main App', dir: '__root__', port: 5173, required: false, color: '\x1b[32m' },
  admin: { name: 'Admin Portal', dir: 'admin-portal', port: 5174, required: false, color: '\x1b[33m' },
  'db-viewer': { name: 'DB Viewer', dir: 'db-viewer', port: 5175, required: false, color: '\x1b[35m' },
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function log(key, msg) {
  const s = SERVICES[key];
  const lines = msg.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) process.stdout.write(`${s.color}[${s.name}]${RESET} ${line}\n`);
  });
}

function startService(key) {
  const s = SERVICES[key];
  const cwd = (s.dir === '.' || s.dir === '__root__') ? process.cwd() : resolve(process.cwd(), s.dir);

  if (!existsSync(resolve(cwd, 'package.json'))) {
    log(key, `\x1b[31mpackage.json not found at ${cwd} — skipping\x1b[0m`);
    return null;
  }

  log(key, `Starting on port ${s.port}...`);

  const isWin = process.platform === 'win32';
  const proc = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  proc.stdout.on('data', d => log(key, d.toString()));
  proc.stderr.on('data', d => {
    const msg = d.toString().trim();
    if (msg && !msg.includes('ExperimentalWarning') && !msg.includes('DeprecationWarning')) {
      log(key, `\x1b[31m${msg}\x1b[0m`);
    }
  });
  proc.on('exit', code => {
    if (code !== null) log(key, `\x1b[31mExited with code ${code}\x1b[0m`);
  });

  return proc;
}

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

async function main() {
  console.clear();
  console.log(`${BOLD}╔══════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}║       IndEase  Dev  Launcher         ║${RESET}`);
  console.log(`${BOLD}╚══════════════════════════════════════╝${RESET}\n`);
  console.log(`  ${SERVICES.server.color}● Server (port 5000) always starts${RESET}\n`);
  console.log(`  ${BOLD}Select frontends to run:${RESET}\n`);
  console.log(`  1 — Main App only          (port 5173)`);
  console.log(`  2 — Admin Portal only      (port 5174)`);
  console.log(`  3 — DB Viewer only         (port 5175)`);
  console.log(`  4 — Main + Admin           (5173 + 5174)`);
  console.log(`  5 — All frontends          (5173 + 5174 + 5175)`);
  console.log(`  6 — Server only            (no frontends)\n`);

  const choice = await ask('  Enter choice [1-6]: ');

  const toStart = ['server'];
  const map = {
    '1': ['main'],
    '2': ['admin'],
    '3': ['db-viewer'],
    '4': ['main', 'admin'],
    '5': ['main', 'admin', 'db-viewer'],
    '6': [],
  };

  const extra = map[choice];
  if (extra === undefined) {
    console.log('\n  Invalid — starting all frontends by default.');
    toStart.push('main', 'admin', 'db-viewer');
  } else {
    toStart.push(...extra);
  }

  console.log('\n' + '─'.repeat(44));
  const procs = toStart.map(startService).filter(Boolean);
  console.log('─'.repeat(44));

  const names = toStart.map(k => `${SERVICES[k].color}${SERVICES[k].name}${RESET}`).join(', ');
  console.log(`\n  Started: ${names}`);
  console.log(`  ${BOLD}Press Ctrl+C to stop all services\n${RESET}`);

  process.on('SIGINT', () => {
    console.log('\n\nStopping all services...');
    procs.forEach(p => { try { p.kill('SIGTERM'); } catch (e) { } });
    setTimeout(() => process.exit(0), 500);
  });

  setInterval(() => { }, 1000 * 60 * 60);
}

main().catch(console.error);
