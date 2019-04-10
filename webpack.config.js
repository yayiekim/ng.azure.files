(function () {
    'use strict';


    const path = require('path');
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    const CleanWebpackPlugin = require('clean-webpack-plugin');

    module.exports = {
        mode: 'development',
        entry: {
            'ng.azure.files': path.resolve(__dirname, './src/app/app.js')
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
        devtool: 'inline-source-map',
        devServer: {
            contentBase: './dist'
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                title: 'Sample App',
                chunks: ['ng.azure.files'],
                inject: false,
                template: 'src/sample.html'
            })
        ],
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/'
        }
    };


    //const path = require('path');
    //const webpack = require('webpack');
    //const HtmlWebpackPlugin = require('html-webpack-plugin');
    //var config = {
    //    context: __dirname,
    //    entry: {
    //        'ng.azure.files': path.resolve(__dirname, './src/app/app.js'),
    //    },
    //    mode: 'development',

    //    devtool: 'inline-source-map',
    //    devServer: {
    //        contentBase: './dist'
    //    },
    //    plugins: [
    //        new HtmlWebpackPlugin({
    //            title: 'Output Management'
    //        }
    //        )],
    //    output: {
    //        filename: '[name].bundle.js',
    //        path: path.resolve(__dirname, 'dist'),
    //        publicPath: '/'
    //    }
    //};

})();
