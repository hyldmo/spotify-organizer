import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import baseConfig from './webpack.config'
import { GenerateSW } from 'workbox-webpack-plugin'

const config: typeof baseConfig = {
	...baseConfig,
	mode: 'production',

	output: {
		...baseConfig.output,
		path: path.join(baseConfig.context, 'dist')
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
			filename: baseConfig.output.filename.toString().replace('.js', '.css'),
			chunkFilename: baseConfig.output.chunkFilename.toString().replace('.js', '.css')
		}),
		new GenerateSW({
			swDest: 'static/service-worker.js',
			maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
		}),
		...baseConfig.plugins
	]
}

module.exports = config
