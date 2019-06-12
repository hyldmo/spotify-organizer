import webpack from 'webpack'
import baseConfig from './webpack.config'

(baseConfig.module.rules[1] as any).use.unshift('style-loader') // Used to load CSS on dev-server

const config: webpack.Configuration = {
	...baseConfig,
	mode: 'development',
	devtool: 'source-map',

	devServer: {
		historyApiFallback: true,
		port: Number.parseInt(process.env.PORT, 10) || 1337,
		overlay: true,
		stats: baseConfig.stats
	}
}

module.exports = config
