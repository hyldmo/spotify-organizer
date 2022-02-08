import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import baseConfig from './webpack.config'

const config: typeof baseConfig = {
	...baseConfig,
	mode: 'production',

	output: {
		path: path.join(baseConfig.context, 'dist'),
		filename: '[name].js',
		chunkFilename: '[name].chunk.js'
	},

	module: {
		rules: [
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
		...baseConfig.plugins
	]
}

module.exports = config
