import path from 'path';
import webpack from 'webpack';

const OUT_PATH = path.resolve('./static');

export default {
  devtool: 'cheap-module-eval-source-map',
  entry: './src/js/index.js',
  mode: 'development',
  output: {
    path: OUT_PATH,
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css?$/,
        use: ['style-loader', 'raw-loader']
      },
      {
        test: /node_modules\/auth0-lock\/.*\.js$/,
        use: [
          'transform-loader/cacheable?brfs',
          'transform-loader/cacheable?packageify'
        ]
      },
      {
        test: /node_modules\/auth0-lock\/.*\.ejs$/,
        use: 'transform-loader/cacheable?ejsify'
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      }
    ]
  }
};
