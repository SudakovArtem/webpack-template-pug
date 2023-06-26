const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const fs = require("fs");
const PugPlugin = require('pug-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const PAGES_DIR = path.join(__dirname, 'source/pug/pages');
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith(".pug"));
console.log(PAGES.length)
PAGES.forEach((page) => {
  console.log(path.join(__dirname, 'source/pug/pages', page));
  console.log(`${page.replace(/\.pug/, ".html")}`)
})

module.exports = {
  entry: [
    path.join(__dirname, 'source/js', 'main.js'),
    path.join(__dirname, 'source/js', 'vendor.js'),
    path.join(__dirname, 'source/sass', 'style.scss'),
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
    assetModuleFilename: path.join('img', '[name].[contenthash][ext]'),
  },
  plugins: [
    ...PAGES.map(page => new HtmlWebpackPlugin({
      template: path.join(__dirname, 'source/pug/pages', page),
      filename: `${page.replace(/\.pug/, ".html")}`
    })),
    new FileManagerPlugin({
      events: {
        onStart: {
          delete: ['build'],
        },
        onEnd: {
          copy: [
            {
              source: path.join('source', 'static'),
              destination: 'build',
            },
            {
              source: path.join('source/img'),
              destination: 'build/img',
            },
            {
              source: path.join('source/fonts'),
              destination: 'build/fonts',
            },
          ],
        },
      },
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
  ],
  devServer: {
    watchFiles: path.join(__dirname, 'source'),
    port: 3000,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.pug$/,
        loader: PugPlugin.loader
        //☝🏽 Load Pug files
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        type: "asset/resource",
        generator: {
          filename: "style.css",
        },
        use: [
          {
            loader: 'file-loader',
            options: { outputPath: 'css/', name: '[name].min.css'}
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: path.join('icons', '[name].[contenthash][ext]'),
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              ['svgo', { name: 'preset-default' }],
            ],
          },
        },
      }),
    ],
  },
};
