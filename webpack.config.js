const path = require('path');
const webpack = require('webpack');


module.exports = {
  devtool: 'cheap-module-eval-source-map',
  context: __dirname,
  entry: [
    'webpack-hot-middleware/client',
    'src/js/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },


  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/,
      include: __dirname
    }, {
      test: /\.css?$/,
      loaders: ['style', 'raw'],
      include: __dirname
    },
    {
      test: /node_modules\/auth0-lock\/.*\.js$/,
      loaders: [
        'transform-loader/cacheable?brfs',
        'transform-loader/cacheable?packageify'
      ]
    }, {
      test: /node_modules\/auth0-lock\/.*\.ejs$/,
      loader: 'transform-loader/cacheable?ejsify'
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  }
};


