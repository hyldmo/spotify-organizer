/* eslint-disable @typescript-eslint/no-namespace */
import type { compose } from 'redux'

declare global {
	interface Window {
		__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose
	}

	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: string
			PACKAGE_NAME: string
			PACKAGE_VERSION: string
		}
	}
}
