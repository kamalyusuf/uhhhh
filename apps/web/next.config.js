const withTM = require("next-transpile-modules")(["types"]);

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  outputFileTracing: false
  // optimizeFonts: false
};

module.exports = withTM(config);
