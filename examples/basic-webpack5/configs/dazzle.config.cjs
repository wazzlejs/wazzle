"use strict";

var webpack5Plugin = require("@elzzad/dazzle-plugin-webpack5").webpack5Plugin;
var webpack5BabelPlugin = require("@elzzad/dazzle-plugin-webpack5-babel").webpack5BabelPlugin;

var LocalPlugin = {
  name: "local-plugin",
  modifyWebpackConfig: function(context, webpackContext, config) {
    console.log("THE CONFIG IS", JSON.stringify(config, null, 2));
    return config;
  }
}

exports.default = {
  plugins: [
    webpack5Plugin(),
    webpack5BabelPlugin(),
    LocalPlugin
  ]
};
