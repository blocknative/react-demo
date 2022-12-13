const webpack = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const path = require("path");

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    assert: require.resolve("assert"),
    buffer: require.resolve("buffer"),
    crypto: require.resolve("crypto-browserify"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify/browser"),
    path: require.resolve("path-browserify"),
    process: require.resolve("process/browser"),
    stream: require.resolve("stream-browserify"),
    url: require.resolve("url"),
    util: require.resolve("util"),
  });
  config.resolve.fallback = fallback;
  config.resolve.alias = {
    ...config.resolve.alias,
    "bn.js": path.resolve(__dirname, "node_modules/bn.js"),
    lodash: path.resolve(__dirname, "node_modules/lodash"),
    "magic-sdk": path.resolve(
      __dirname,
      "node_modules/magic-sdk/dist/cjs/index.js"
    ),
  };
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /genesisStates\/[a-z]*\.json$/,
      contextRegExp: /@ethereumjs\/common/,
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "disabled"
    }),
  ]);
  config.ignoreWarnings = [/Failed to parse source map/];
  config.module.rules.push({
    test: /\.(js|mjs|jsx)$/,
    enforce: "pre",
    loader: require.resolve("source-map-loader"),
    resolve: {
      fullySpecified: false,
    },
  });
  return config;
};