import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/index.js');
const CONTENT = Buffer.from('hello world');
const MD5 = crypto.createHash('md5').update(CONTENT).digest('hex');
const SHA256 = crypto.createHash('sha256').update(CONTENT).digest('hex');

let server;
let port;
let tmpDir;

beforeAll((done) => {
  server = http.createServer((req, res) => {
    if (req.url === '/file.txt') {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.end(CONTENT);
    } else {
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
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function run(inputs) {
  return new Promise((resolve) => {
    const outputFile = path.join(os.tmpdir(), `gh-output-${process.hrtime.bigint()}`);
    fs.writeFileSync(outputFile, '');
    const env = { ...process.env, GITHUB_OUTPUT: outputFile };
    for (const [k, v] of Object.entries(inputs)) {
      env[`INPUT_${k.replace(/ /g, '_').toUpperCase()}`] = v;
    }
    const proc = spawn('node', [DIST], { env });
    let output = '';
    proc.stdout.on('data', (d) => { output += d; });
    proc.stderr.on('data', (d) => { output += d; });
    proc.on('close', (code) => {
      const raw = fs.readFileSync(outputFile, 'utf8');
      fs.unlinkSync(outputFile);
      const outputs = {};
      const lines = raw.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const heredoc = lines[i].match(/^(.+)<<(.+)$/);
        if (heredoc) {
          const [, name, delimiter] = heredoc;
          const valueLines = [];
          i++;
          while (i < lines.length && lines[i] !== delimiter) {
            valueLines.push(lines[i]);
            i++;
          }
          outputs[name] = valueLines.join('\n');
        } else {
          const eq = lines[i].indexOf('=');
          if (eq !== -1) outputs[lines[i].slice(0, eq)] = lines[i].slice(eq + 1);
        }
      }
      resolve({ code, output, outputs });
    });
  });
}

describe('dist/index.js', () => {
  test('downloads file and sets file-path output', async () => {
    const result = await run({
      'file-url': `http://127.0.0.1:${port}/file.txt`,
      'location': tmpDir,
    });
    expect(result.code).toBe(0);
    expect(result.outputs['file-path']).toBe(path.join(tmpDir, 'file.txt'));
    expect(fs.existsSync(result.outputs['file-path'])).toBe(true);
  }, 15000);

  test('respects file-name input', async () => {
    const result = await run({
      'file-url': `http://127.0.0.1:${port}/file.txt`,
      'file-name': 'custom.txt',
      'location': tmpDir,
    });
    expect(result.code).toBe(0);
    expect(result.outputs['file-path']).toBe(path.join(tmpDir, 'custom.txt'));
    expect(fs.existsSync(result.outputs['file-path'])).toBe(true);
  }, 15000);

  test('fails when file-url is missing', async () => {
    const result = await run({ 'location': tmpDir });
    expect(result.code).toBe(1);
    expect(result.outputs['file-path']).toBeUndefined();
  }, 15000);

  test('succeeds with correct MD5', async () => {
    const result = await run({
      'file-url': `http://127.0.0.1:${port}/file.txt`,
      'location': tmpDir,
      'md5': MD5,
    });
    expect(result.code).toBe(0);
    expect(result.outputs['file-path']).toBeDefined();
  }, 15000);

  test('fails with wrong MD5', async () => {
    const result = await run({
      'file-url': `http://127.0.0.1:${port}/file.txt`,
      'location': tmpDir,
      'md5': '00000000000000000000000000000000',
    });
    expect(result.code).toBe(1);
    expect(result.output).toContain("doesn't match");
  }, 15000);

  test('succeeds with correct SHA256', async () => {
    const result = await run({
      'file-url': `http://127.0.0.1:${port}/file.txt`,
      'location': tmpDir,
      'sha256': SHA256,
    });
    expect(result.code).toBe(0);
    expect(result.outputs['file-path']).toBeDefined();
  }, 15000);

  test('fails with wrong SHA256', async () => {
    const result = await run({
      'file-url': `http://127.0.0.1:${port}/file.txt`,
      'location': tmpDir,
      'sha256': '0000000000000000000000000000000000000000000000000000000000000000',
    });
    expect(result.code).toBe(1);
    expect(result.output).toContain("doesn't match");
  }, 15000);
});
