import type { Configuration as DevServerConfig } from 'webpack-dev-server'
import type { Configuration as WebpackConfig } from 'webpack'

export type Configuration = WebpackConfig & { devServer?: DevServerConfig }
