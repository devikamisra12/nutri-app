'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

process.env.HOSTNAME = '0.0.0.0';
const port = process.env.PORT || '8080';
process.env.PORT = String(port);

const candidates = [
  path.join(process.cwd(), 'server.js'),
  path.join(process.cwd(), '.next', 'standalone', 'server.js'),
];
const target = candidates.find((file) => fs.existsSync(file));

if (!target) {
  console.error('[railway-start] Next.js server.js was not found. Checked:', candidates);
  process.exit(1);
}

console.log(`[railway-start] starting ${target} on 0.0.0.0:${port}`);

const child = spawn(process.execPath, [target], {
  stdio: 'inherit',
  env: {
    ...process.env,
    HOSTNAME: '0.0.0.0',
    PORT: String(port),
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
