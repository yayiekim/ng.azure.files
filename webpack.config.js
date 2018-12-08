(function () {
  'use strict';

  const path = require('path');
  const webpack = require('webpack');

  var config = {
    context: __dirname,
    entry: {
      'ng.azure.files': path.resolve(__dirname, './src/app/app.js'),
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }]
    },
    plugins: [],
  };

  module.exports = config;

})();
