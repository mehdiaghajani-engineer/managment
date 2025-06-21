const { addBabelPlugin } = require('customize-cra');

module.exports = function override(config, env) {
  config = addBabelPlugin('@babel/plugin-proposal-optional-chaining')(config);
  return config;
};