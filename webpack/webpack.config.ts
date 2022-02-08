import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import { Configuration, DefinePlugin, SourceMapDevToolPlugin } from 'webpack'
import packageJSON from '../package.json'
import { getFolders } from './utils'
import tsConfig from '../tsconfig.json'

const context = path.resolve(__dirname, '../')

const config: Configuration = {
	entry: './src/index.tsx',
	devtool: false, // Added by SourceMapDevToolPlugin
	context,

	output: {
		assetModuleFilename: 'static/[name][ext]',
		chunkFilename: 'static/[name].chunk.js',
		filename: 'static/[name].[contenthash].js'
	},

	resolve: {
		alias: {
			styles: path.resolve(__dirname, 'src/styles'),
			...getFolders(path.join(context, tsConfig.compilerOptions.baseUrl))
		},
		extensions: packageJSON.jest.moduleFileExtensions.map(ext => `.${ext}`)
	},

	module: {
		rules: [
			{
				test: /\.(webmanifest|png|svg)$/i,
				type: 'asset/resource'
			}
		]
	},

	plugins: [
		new HtmlWebpackPlugin({
			title: packageJSON.name
				.split('-')
				.map(name => name.charAt(0).toUpperCase() + name.slice(1))
				.join(' '),
			version: packageJSON.version,
			template: 'static/index.ejs',
			favicon: 'static/favicon.svg',
			minify: false // No need, file is small
		}),
		new DefinePlugin({
			'process.env.PACKAGE_NAME': JSON.stringify(packageJSON.name),
			// process.env.PACKAGE_VERSION is provided by CI, set default for local development
			'process.env.PACKAGE_VERSION': JSON.stringify(process.env.PACKAGE_VERSION || '-local'),
			'process.env.PACKAGE_REPOSITORY': JSON.stringify(packageJSON.repository)
		}),
		new SourceMapDevToolPlugin({
			filename: '[file].map',
			publicPath: '/'
		})
	],

	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			cacheGroups: {
				chunks: 'initial',
				commons: {
					test: /node_modules/,
					name: 'vendor',
					chunks: 'all'
				}
			}
		}
	}
}

export default config
