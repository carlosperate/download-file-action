import http from 'http';
import path from 'path';
import fs from 'fs';
import os from 'os';
import download from '../src/download-mod.js';

// Minimal PNG signature (8 bytes) — enough for file-type magic bytes detection
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...Array(64).fill(0)]);

describe('download-mod', () => {
  let server;
  let port;
  let tmpDir;

  beforeAll((done) => {
    server = http.createServer((req, res) => {
      switch (req.url) {
        case '/file.tar.gz':
          res.writeHead(200, { 'content-type': 'application/gzip' });
          res.end(Buffer.alloc(16));
          break;
        case '/content-disposition':
          res.writeHead(200, {
            'content-disposition': 'attachment; filename="explicit-name.txt"',
            'content-type': 'text/plain',
          });
          res.end(Buffer.from('hello'));
          break;
        case '/no-ext-mime':
          // Extensionless URL — extension should come from MIME type.
          // CSV content: file-type cannot detect this from magic bytes, so
          // the MIME type fallback is exercised.
          res.writeHead(200, { 'content-type': 'text/csv' });
          res.end(Buffer.from('col1,col2\nval1,val2'));
          break;
        case '/no-ext-magic':
          // Extensionless URL — no content-type, extension from magic bytes.
          res.writeHead(200);
          res.end(PNG_MAGIC);
          break;
        default:
          res.writeHead(404);
          res.end();
      }
    });
    server.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => { server.close(done); });

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'download-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('preserves filename from URL when it has an extension', async () => {
    const filePath = await download(`http://127.0.0.1:${port}/file.tar.gz`, tmpDir);
    expect(path.basename(filePath)).toBe('file.tar.gz');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('uses content-disposition filename over URL path', async () => {
    const filePath = await download(`http://127.0.0.1:${port}/content-disposition`, tmpDir);
    expect(path.basename(filePath)).toBe('explicit-name.txt');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('adds extension from MIME type for extensionless URL when magic bytes undetectable', async () => {
    const filePath = await download(`http://127.0.0.1:${port}/no-ext-mime`, tmpDir);
    expect(path.basename(filePath)).toBe('no-ext-mime.csv');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('adds extension from magic bytes for extensionless URL with no content-type', async () => {
    const filePath = await download(`http://127.0.0.1:${port}/no-ext-magic`, tmpDir);
    expect(path.basename(filePath)).toBe('no-ext-magic.png');
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
