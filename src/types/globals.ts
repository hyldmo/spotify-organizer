/* eslint-disable @typescript-eslint/no-namespace */
import { compose } from 'redux'
import { State } from '../types'

declare global {
	interface Window {
		__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose
	}

	// eslint-disable-next-line no-shadow
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: string
			PACKAGE_NAME: string
			PACKAGE_VERSION: string
		}
	}
}

declare module 'react-redux' {
	// Augment DefaultRootState from 'react-redux' so that useSelector and other methods get automatic typing

	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface DefaultRootState extends State {}
}
