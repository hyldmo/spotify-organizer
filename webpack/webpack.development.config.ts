import webpack from 'webpack'
import baseConfig from './webpack.config'
;((baseConfig.module.rules[1] as webpack.RuleSetRule).use as webpack.RuleSetUseItem[]).unshift('style-loader')

const config: webpack.Configuration = {
	...baseConfig,
	mode: 'development',

	resolve: {
		...baseConfig.resolve,
		alias: {
			...baseConfig.resolve.alias,
			'react-dom': '@hot-loader/react-dom'
		}
	},

	output: {
		publicPath: 'http://localhost:1337/',
		filename: '[name].js'
	},

	devServer: {
		hot: true,
		compress: true,
		historyApiFallback: true,
		port: 1337,
		overlay: true,
		disableHostCheck: true,

		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	}
}

module.exports = config
