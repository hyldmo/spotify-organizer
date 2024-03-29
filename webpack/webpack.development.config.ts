﻿// eslint-disable-next-line spaced-comment
import baseConfig from './webpack.config'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import ReactRefreshTypeScript from 'react-refresh-typescript'
import 'webpack-dev-server' // Add typing to devServer

const config: typeof baseConfig = {
	...baseConfig,
	mode: 'development',

	output: {
		...baseConfig.output,
		publicPath: 'http://localhost:1337/',
		filename: '[name].js'
	},

	module: {
		rules: [
			...baseConfig.module.rules,
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
				options: {
					compilerOptions: {
						jsx: 'react-jsxdev'
					},
					getCustomTransformers: () => ({
						before: [ReactRefreshTypeScript()]
					})
				}
			},
			{
				test: /\.s?css$/,
				use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
			}
		]
	},

	plugins: [new ReactRefreshWebpackPlugin(), ...baseConfig.plugins],

	devServer: {
		hot: true,
		port: 1337,
		historyApiFallback: true,
		allowedHosts: 'all',

		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	}
}

module.exports = config
