import * as path from 'path';

import * as core from '@actions/core';
import md5File from 'md5-file';

const download = require('./download-mod');

async function main(): Promise<void> {
  try {
    const fileURL: string = core.getInput('file-url');
    const fileName: string | undefined = core.getInput('file-name') || undefined;
    const fileLocation: string = core.getInput('location') || process.cwd();
    const fileMd5: string = core.getInput('md5');

    if (!fileURL) {
      core.setFailed('The file-url input was not set.');
    }

    core.info('Downloading file:');
    core.info(`\turl: ${fileURL}`);
    core.info(`\tname: ${fileName || 'Not set'}`);
    core.info(`\tlocation: ${fileLocation}`);
    core.info(`\tMD5: ${fileLocation}`);
    let filePath = await download(fileURL, fileLocation, {
      filename: fileName,
    });
    filePath = path.normalize(filePath);

    const downloadHash = await md5File(filePath);
    core.info(`Downloaded file MD5: ${downloadHash}`);
    if (fileMd5 && downloadHash !== fileMd5) {
      throw new Error(`File MD5 (left) doesn't match expected value (right): ${downloadHash} != ${fileMd5}`);
    } else {
      core.info('Provided MD5 hash matches.');
    }

    core.info('File successfully downloaded.');
    core.setOutput('file-path', filePath);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

main();
