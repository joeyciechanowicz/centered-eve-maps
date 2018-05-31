const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  module: {
    rules: []
  },
  devServer: {},
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: './index.html'
    })
  ],
  output: {
    path: __dirname + '/dist',
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
  }
};
