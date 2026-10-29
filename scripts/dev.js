#!/usr/bin/env node
/**
 * Centralized concurrent runner for CPRS (Server + Client).
 * Runs both the Express API (port 5000) and Vite React SPA (port 5173)
 * in a single terminal with color-coded log prefixes.
 */

const { spawn } = require('child_process');
const path = require('path');

const mode = process.argv.includes('--prod') ? 'prod' : 'dev';
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const COLORS = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function prefixStream(stream, label, color, target) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || '';
    for (const line of lines) {
      target.write(`${color}[${label}]${COLORS.reset} ${line}\n`);
    }
  });
  stream.on('end', () => {
    if (buffer.trim()) {
      target.write(`${color}[${label}]${COLORS.reset} ${buffer}\n`);
    }
  });
}

function startService(name, cwd, scriptArgs, color) {
  const child = spawn(npmCmd, scriptArgs, {
    cwd,
    shell: isWin,
    env: { ...process.env, FORCE_COLOR: '1' },
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  prefixStream(child.stdout, name, color, process.stdout);
  prefixStream(child.stderr, name, color, process.stderr);

  child.on('error', (err) => {
    console.error(`${COLORS.red}[${name}] Failed to start: ${err.message}${COLORS.reset}`);
  });

  return child;
}

console.log(
  `${COLORS.yellow}Starting CPRS (${mode === 'prod' ? 'Production' : 'Development'}) — Server (:5000) + Client (:5173)...${COLORS.reset}\n`
);

const serverArgs = mode === 'prod' ? ['start'] : ['run', 'dev'];
const clientArgs = mode === 'prod' ? ['run', 'preview'] : ['run', 'dev'];

const children = [
  startService('SERVER', serverDir, serverArgs, COLORS.cyan),
  startService('CLIENT', clientDir, clientArgs, COLORS.green),
];

let shuttingDown = false;
function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (child && !child.killed) {
      try {
        child.kill('SIGTERM');
      } catch {
        // Ignore cleanup errors
      }
    }
  }
  setTimeout(() => process.exit(exitCode), 200);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

for (const child of children) {
  child.on('exit', (code) => {
    if (!shuttingDown && code && code !== 0) {
      shutdown(code);
    }
  });
}

