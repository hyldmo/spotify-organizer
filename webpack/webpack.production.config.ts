import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import baseConfig from './webpack.config'
import { GenerateSW } from 'workbox-webpack-plugin'

const config: typeof baseConfig = {
	...baseConfig,
	mode: 'production',

	output: {
		...baseConfig.output,
		path: path.join(baseConfig.context, 'dist'),
		filename: '[name].[contenthash].js',
		chunkFilename: '[name].chunk.js'
	},

	module: {
		rules: [
			...baseConfig.module.rules,
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.s?css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
			}
		]
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[name].css'
		}),
		new GenerateSW({
			maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
		}),
		...baseConfig.plugins
	]
}

module.exports = config
