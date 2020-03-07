import * as core from '@actions/core';

const download = require('./download-mod');

async function main(): Promise<void> {
  try {
    const fileURL: string = core.getInput('file-url');
    const fileName: string | undefined = core.getInput('file-name') || undefined;
    const fileLocation: string = core.getInput('location') || process.cwd();

    if (!fileURL) {
      core.warning('The file-url input was not set.');
    }

    core.info('Downloading file:');
    core.info(`\turl: ${fileURL}`);
    core.info(`\tname: ${fileName || 'Not set'}`);
    core.info(`\tlocation: ${fileLocation}`);
    const filePath = await download(fileURL, fileLocation, {
      filename: fileName,
    });

    core.setOutput('file-path', filePath);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
