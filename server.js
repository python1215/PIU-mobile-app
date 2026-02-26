const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 5000;
const BACKEND_PORT = 8080;
const JAR_PATH = path.join(__dirname, 'backend', 'target', 'piuproject-1.0.0.jar');
const STATIC_DIR = path.join(__dirname, 'dist');

let backendReady = false;

function checkBackend() {
  return new Promise((resolve) => {
    const req = http.request({ hostname: '127.0.0.1', port: BACKEND_PORT, path: '/health', timeout: 2000 }, (res) => {
      res.resume();
      resolve(res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function waitForBackend() {
  for (let i = 0; i < 120; i++) {
    if (await checkBackend()) {
      backendReady = true;
      console.log(`[PROXY] Spring Boot ready after ~${i} seconds`);
      return;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('[PROXY] Spring Boot failed to start within 120s');
}

const javaProcess = spawn('java', [
  '-Xms128m', '-Xmx512m', '-XX:+UseSerialGC', '-XX:MaxMetaspaceSize=128m',
  '-Dserver.port=' + BACKEND_PORT,
  '-Dspring.jpa.hibernate.ddl-auto=update',
  '-jar', JAR_PATH
], { stdio: ['ignore', 'pipe', 'pipe'] });

javaProcess.stdout.on('data', (d) => process.stdout.write('[SPRING] ' + d));
javaProcess.stderr.on('data', (d) => process.stderr.write('[SPRING] ' + d));
javaProcess.on('exit', (code) => { console.log(`[SPRING] Exited with code ${code}`); process.exit(code || 1); });

waitForBackend();

const MIME_TYPES = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.map': 'application/json'
};

function serveStatic(req, res) {
  let filePath = path.join(STATIC_DIR, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(STATIC_DIR, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', service: 'PIU Project Management API' }));
    return;
  }
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
}

function proxyToBackend(req, res) {
  const options = {
    hostname: '127.0.0.1', port: BACKEND_PORT,
    path: req.url, method: req.method,
    headers: Object.assign({}, req.headers, { host: '127.0.0.1:' + BACKEND_PORT })
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', () => {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend starting up' }));
  });
  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', backend_ready: backendReady }));
    return;
  }

  if (req.url.startsWith('/api/')) {
    if (!backendReady) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend starting', message: 'Server is starting up, please try again.' }));
      return;
    }
    proxyToBackend(req, res);
    return;
  }

  if (backendReady && (req.url.startsWith('/uploads/') || req.url.startsWith('/api/'))) {
    proxyToBackend(req, res);
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[PROXY] Listening on port ${PORT}, waiting for Spring Boot on ${BACKEND_PORT}...`);
});

process.on('SIGTERM', () => { javaProcess.kill(); process.exit(0); });
process.on('SIGINT', () => { javaProcess.kill(); process.exit(0); });
