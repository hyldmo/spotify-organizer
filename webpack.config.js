"use strict";
exports.__esModule = true;
var HtmlWebpackPlugin = require("html-webpack-plugin");
var path = require("path");
var webpack = require("webpack");
var packageJSON = require('./package.json');
var config = {
    entry: './src/index.tsx',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name]-[hash].js'
    },
    resolve: {
        alias: {
            styles: path.resolve(__dirname, 'src/styles')
        },
        extensions: packageJSON.jest.moduleFileExtensions.map(function (ext) { return "." + ext; })
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            },
            {
                test: /\.scss$/,
                use: ['css-loader', 'postcss-loader', 'sass-loader'].map(function (loader) { return ({
                    loader: loader,
                    options: { sourceMap: true }
                }); })
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: packageJSON.name
                .split('-')
                .map(function (name) { return name.charAt(0).toUpperCase() + name.slice(1); })
                .join(' '),
            version: packageJSON.version,
            template: 'static/index.ejs'
        }),
        new webpack.DefinePlugin({
            'process.env.PACKAGE_NAME': JSON.stringify(packageJSON.name),
            'process.env.PACKAGE_VERSION': JSON.stringify(packageJSON.version)
        })
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    chunks: 'initial',
                    test: path.resolve(__dirname, 'node_modules'),
                    name: 'vendor',
                    enforce: true
                }
            }
        }
    },
    stats: {
        assets: true,
        children: false,
        chunks: false,
        hash: false,
        modules: false,
        publicPath: true,
        timings: false,
        version: false,
        warnings: true
    }
};
exports["default"] = config;
