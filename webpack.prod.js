const HtmlWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const common = require('./webpack.common')
const { merge } = require('webpack-merge')
const path = require('path')

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath:'/clickscan/',
    // main bundle
    filename: '[name].[contenthash].js',
    // vendor bundle
    chunkFilename: '[name].[contenthash].js',
    clean: true
  },
  optimization: {
    // vendor bundle
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    minimize: true,
    minimizer: [new TerserPlugin()]
  },
  plugins: [
    new Dotenv({
      path: '.env.production'
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].[contenthash].css",
    }),
    new HtmlWebpackPlugin({
      template: 'template.prod.html',
      favicon: './src/assets/images/favicon.png'
    }),
    new CleanWebpackPlugin(),
  ]
})