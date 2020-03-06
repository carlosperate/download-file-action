const core = require("@actions/core");

try {
    // Get Action inputs
    const fileURL = core.getInput("file-url");
    const fileName = core.getInput("file-name");
    const fileLocation = core.getInput("location");
    console.log(`url: ${fileURL}`);
    console.log(`name: ${fileName}`);
    console.log(`location: ${fileLocation}`);
    core.setOutput("file-path", `${fileLocation}/${fileName}`);
} catch (error) {
    core.setFailed(error.message);
}
