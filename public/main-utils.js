const path = require('path');

// https://stackoverflow.com/a/60889241
function getAppDataPath() {
  switch (process.platform) {
    case "darwin": {
      return path.join(process.env.HOME, "Library", "Application Support", "sse-app");
    }
    case "win32": {
      return path.join(process.env.APPDATA, "see-app");
    }
    case "linux": {
      return path.join(process.env.HOME, ".sse-app");
    }
    default: {
      console.log("Unsupported platform!");
      process.exit(1);
    }
  }
}

exports.getAppDataPath = getAppDataPath 