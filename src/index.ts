import * as core from '@actions/core';

try {
  // Get Action inputs
  const fileURL = core.getInput('file-url');
  const fileName = core.getInput('file-name');
  const fileLocation = core.getInput('location');
  core.info(`url: ${fileURL}`);
  core.info(`name: ${fileName}`);
  core.info(`location: ${fileLocation}`);
  core.setOutput('file-path', `${fileLocation}/${fileName}`);
} catch (error) {
  core.setFailed(error.message);
}
