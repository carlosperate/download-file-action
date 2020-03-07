import * as core from '@actions/core';
const download = require('./download-mod');

async function main(): Promise<void> {
  try {
    const fileURL: string = core.getInput('file-url');
    const fileName: string | undefined = core.getInput('file-name') || undefined;
    const fileLocation: string = core.getInput('location') || process.cwd();

    if (!fileURL) {
      core.warning('the file-url input was not set.');
    }

    core.info(`url: ${fileURL}`);
    core.info(`name: ${fileName}`);
    core.info(`location: ${fileLocation}`);
    await download(fileURL, fileLocation, {
      extract: false,
      filename: fileName,
    });

    core.setOutput('file-path', `${fileLocation}/${fileName}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
