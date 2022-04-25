const path = require("path");

module.exports = {
  reactScriptsVersion: "react-scripts" /* (default value) */,

  webpack: {
    alias: {
      "magic-sdk": path.resolve(
        __dirname,
        "node_modules/magic-sdk/dist/cjs/index.js"
      ),
    },
  },
};
