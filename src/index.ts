import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import * as core from '@actions/core';
import md5File from 'md5-file';

const download = require('./download-mod');

async function main(): Promise<void> {
  try {
    const fileURL: string = core.getInput('file-url', { required: true });
    const fileName: string | undefined = core.getInput('file-name') || undefined;
    const fileLocation: string = core.getInput('location') || process.cwd();
    const fileMd5: string = core.getInput('md5').toLowerCase();
    const fileSha256: string = core.getInput('sha256').toLowerCase();

    core.info('Downloading file:');
    core.info(`\turl: ${fileURL}`);
    core.info(`\tname: ${fileName || 'Not set'}`);
    core.info(`\tlocation: ${fileLocation}`);
    core.info(`\tMD5: ${fileMd5 || 'Not set'}`);
    core.info(`\tSHA256: ${fileSha256 || 'Not set'}`);

    let filePath = await download(fileURL, fileLocation, {
      filename: fileName,
    });
    filePath = path.normalize(filePath);
    core.info(`Downloaded: ${filePath}`);

    if (fileMd5) {
      core.info('Verifying MD5...');
      let downloadMd5 = await md5File(filePath);
      downloadMd5 = downloadMd5.toLowerCase();
      core.info(`Downloaded file MD5: ${downloadMd5}`);
      if (downloadMd5 !== fileMd5) {
        throw new Error(`File MD5 (left) doesn't match expected value (right): ${downloadMd5} != ${fileMd5}`);
      } else {
        core.info('Provided MD5 hash matches.');
      }
    }

    if (fileSha256) {
      core.info('Verifying SHA256...');
      const fileBuffer = fs.readFileSync(filePath);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      const downloadSha256 = hashSum.digest('hex').toLowerCase();
      core.info(`Downloaded file SHA256: ${downloadSha256}`);
      if (downloadSha256 !== fileSha256) {
        throw new Error(`File SHA256 (left) doesn't match expected value (right): ${downloadSha256} != ${fileSha256}`);
      } else {
        core.info('Provided SHA256 hash matches.');
      }
    }

    core.info('File successfully downloaded.');
    core.setOutput('file-path', filePath);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

main();
