const rules = require('./webpack.rules');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  module: {
    rules,
  },
  // plugins: [new ForkTsCheckerWebpackPlugin()],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      // React Hot Loader Patch
      'react-dom': '@hot-loader/react-dom',
      // Custom Aliases
      ...require('./webpack.aliases'),
    },
  },
  stats: 'minimal',
};
