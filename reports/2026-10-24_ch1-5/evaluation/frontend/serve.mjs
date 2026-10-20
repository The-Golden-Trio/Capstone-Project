// Static server for the production web build, standing in for the CDN of Section 5.3:
// gzip for text assets, long cache for hashed assets, SPA fallback, and /api proxied
// to the API on :3000 so the page and the API share an origin as in deployment.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = process.argv[2];
const PORT = Number(process.argv[3] || 4300);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.glb': 'model/gltf-binary',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};
const cache = new Map();

http
  .createServer(async (req, res) => {
    if (req.url.startsWith('/api/')) {
      const up = http.request(
        {
          host: 'localhost',
          port: 3000,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (r) => {
          res.writeHead(r.statusCode, r.headers);
          r.pipe(res);
        },
      );
      up.on('error', () => {
        res.writeHead(502);
        res.end();
      });
      req.pipe(up);
      return;
    }
    let file = normalize(join(ROOT, decodeURIComponent(req.url.split('?')[0])));
    if (!file.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end();
    }
    try {
      if (!(await stat(file)).isFile()) throw 0;
    } catch {
      file = join(ROOT, 'index.html');
    }
    const type = TYPES[extname(file)] || 'application/octet-stream';
    let body = cache.get(file);
    if (!body) {
      const raw = await readFile(file);
      const gz = /text|javascript|json|svg/.test(type)
        ? gzipSync(raw, { level: 9 })
        : null;
      body = { raw, gz };
      cache.set(file, body);
    }
    const headers = {
      'content-type': type,
      'cache-control': file.includes('/assets/')
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
    };
    // Range requests, as a CDN serves media: without them the browser refetches a video whole.
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && !body.gz) {
      const size = body.raw.length;
      const start = range[1] ? Number(range[1]) : size - Number(range[2]);
      const end =
        range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      res.writeHead(206, {
        ...headers,
        'accept-ranges': 'bytes',
        'content-range': `bytes ${start}-${end}/${size}`,
        'content-length': end - start + 1,
      });
      res.end(body.raw.subarray(start, end + 1));
    } else if (body.gz && /gzip/.test(req.headers['accept-encoding'] || '')) {
      res.writeHead(200, {
        ...headers,
        'content-encoding': 'gzip',
        vary: 'accept-encoding',
      });
      res.end(body.gz);
    } else {
      res.writeHead(
        200,
        body.gz ? headers : { ...headers, 'accept-ranges': 'bytes' },
      );
      res.end(body.raw);
    }
  })
  .listen(PORT, () => console.log(`serving ${ROOT} on ${PORT}`));
