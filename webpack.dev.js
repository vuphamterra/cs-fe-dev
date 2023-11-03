const path = require('path')

const Dotenv = require('dotenv-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const common = require('./webpack.common')
const { merge } = require('webpack-merge')

const fs = require('fs')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath:'/',
    // main bundle
    filename: '[name].[contenthash].js',
    // vendor bundle
    chunkFilename: '[name].[contenthash].js',
    clean: true
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
      watch: true
    },    
    historyApiFallback: true,
    port: 3000,
  },
  plugins: [
    new Dotenv({
      path: '.env.development'
    }),
    new MiniCssExtractPlugin({
      filename: "global.css",
      chunkFilename: "global.css"
    }),
    new HtmlWebpackPlugin({
      template: 'template.dev.html',
      favicon: './src/assets/images/favicon.png'
    })
  ]
})