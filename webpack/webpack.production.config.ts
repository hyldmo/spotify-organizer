import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import webpack from 'webpack'
import baseConfig from './webpack.config'
;((baseConfig.module.rules[1] as webpack.RuleSetRule).use as webpack.RuleSetUseItem[]).unshift(
	MiniCssExtractPlugin.loader
)

const config: webpack.Configuration = {
	...baseConfig,

	output: {
		path: path.join(baseConfig.context, 'dist'),
		filename: '[name].js',
		chunkFilename: '[name].chunk.js'
	},

	mode: 'production',
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[name].css'
		}),
		...baseConfig.plugins
	]
}

module.exports = config
