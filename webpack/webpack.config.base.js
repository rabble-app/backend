/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const _ = require('lodash');
const slsw = require('serverless-webpack');
require('source-map-support').install();
const { isLocal } = slsw.lib.webpack;

const defaults = {
  entry: slsw.lib.entries,
  target: 'node',
  stats: 'normal',
  entry: slsw.lib.entries,
  externals: [nodeExternals()],
  mode: isLocal ? 'development' : 'production',
  optimization: { concatenateModules: false },
  resolve: { extensions: ['.js'] },
  output: {
    libraryTarget: 'commonjs',
    filename: '[name].js',
    path: path.resolve(__dirname, '.webpack'),
  },
  resolve: { modules: ['src', 'node_modules'], extensions: ['.js', '.ts'] },
  //   output: {
  //     libraryTarget: 'commonjs',
  //     path: path.join(rootDir, '.webpack'),
  //     filename: '[name].js',
  //   },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};

module.exports.defaults = defaults;

module.exports.merge = function merge(config) {
  return _.merge({}, defaults, config);
};
