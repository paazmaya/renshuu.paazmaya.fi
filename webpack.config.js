const path = require('path');
const webpack = require('webpack');

const OUT_PATH = path.join(__dirname, 'dist');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: './src/js/index.js',
  output: {
    path: OUT_PATH,
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        exclude: /node_modules/
      },
      {
        test: /\.css?$/,
        loaders: ['style', 'raw']
      },
      {
        test: /node_modules\/auth0-lock\/.*\.js$/,
        loaders: [
          'transform-loader/cacheable?brfs',
          'transform-loader/cacheable?packageify'
        ]
      },
      {
        test: /node_modules\/auth0-lock\/.*\.ejs$/,
        loader: 'transform-loader/cacheable?ejsify'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  }
};


