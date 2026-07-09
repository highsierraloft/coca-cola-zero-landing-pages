import { realpath, stat } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = await realpath(resolve(scriptDirectory, '..'));
const hostname = '127.0.0.1';
const rawPort = process.env.PORT ?? '4173';
const port = Number(rawPort);

if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${rawPort}`);
}

const publicEntries = new Set([
  'index.html',
  'gallery.css',
  'coke-zero-54',
  'coke-zero-55',
  'gemini-antigravity',
  'gpt-56-sol',
  'gpt-56-terra',
  'gpt-56-luna',
]);

const baseHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

function responseForStatus(status, method, extraHeaders = {}) {
  const messages = {
    400: 'Bad Request',
    404: 'Not Found',
    405: 'Method Not Allowed',
  };
  const message = messages[status] ?? 'Error';
  const body = method === 'HEAD' ? null : `${message}\n`;

  return new Response(body, {
    status,
    headers: {
      ...baseHeaders,
      'Content-Type': 'text/plain; charset=utf-8',
      ...extraHeaders,
    },
  });
}

function rawPathname(requestUrl) {
  const schemeEnd = requestUrl.indexOf('://');
  const pathStart = requestUrl.indexOf('/', schemeEnd + 3);

  if (pathStart === -1) {
    return '/';
  }

  const queryStart = requestUrl.indexOf('?', pathStart);
  return requestUrl.slice(
    pathStart,
    queryStart === -1 ? requestUrl.length : queryStart,
  );
}

function isWithinRoot(pathname) {
  const relativePath = relative(repoRoot, pathname);
  return (
    relativePath === '' ||
    (relativePath !== '..' &&
      !relativePath.startsWith(`..${sep}`) &&
      !isAbsolute(relativePath))
  );
}

async function resolvePublicFile(requestUrl) {
  const rawPath = rawPathname(requestUrl);
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    return { error: 400 };
  }

  if (
    !decodedPath.startsWith('/') ||
    decodedPath.includes('\0') ||
    decodedPath.includes('\\')
  ) {
    return { error: 404 };
  }

  const segments = decodedPath.split('/').filter(Boolean);

  if (
    segments.some((segment) => segment.startsWith('.')) ||
    (segments.length > 0 && !publicEntries.has(segments[0]))
  ) {
    return { error: 404 };
  }

  if (decodedPath.endsWith('/')) {
    segments.push('index.html');
  }

  const candidatePath = resolve(repoRoot, ...segments);
  if (!isWithinRoot(candidatePath)) {
    return { error: 404 };
  }

  let canonicalPath;
  try {
    canonicalPath = await realpath(candidatePath);
  } catch {
    return { error: 404 };
  }

  if (!isWithinRoot(canonicalPath)) {
    return { error: 404 };
  }

  let fileInfo;
  try {
    fileInfo = await stat(canonicalPath);
  } catch {
    return { error: 404 };
  }

  if (!fileInfo.isFile()) {
    return { error: 404 };
  }

  return { path: canonicalPath, size: fileInfo.size };
}

function startServer() {
  const server = Bun.serve({
    hostname,
    port,
    async fetch(request) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return responseForStatus(405, request.method, { Allow: 'GET, HEAD' });
      }

      const result = await resolvePublicFile(request.url);
      if (result.error) {
        return responseForStatus(result.error, request.method);
      }

      const file = Bun.file(result.path);
      const headers = {
        ...baseHeaders,
        'Content-Length': String(result.size),
        'Content-Type': file.type || 'application/octet-stream',
      };

      if (request.method === 'HEAD') {
        return new Response(null, { status: 200, headers });
      }

      return new Response(file, { status: 200, headers });
    },
  });

  console.log(`Preview server listening on http://${hostname}:${server.port}`);

  let stopping = false;
  function stopServer(signal) {
    if (stopping) {
      return;
    }

    stopping = true;
    console.log(`Received ${signal}; stopping preview server`);
    server.stop(true);
  }

  process.once('SIGINT', () => stopServer('SIGINT'));
  process.once('SIGTERM', () => stopServer('SIGTERM'));
}

if (!process.execArgv.includes('--check')) {
  startServer();
}
