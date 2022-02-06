import { ConnectedRouter } from 'connected-react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import React from 'react'
import { Provider } from 'react-redux'
import RedBox from 'redbox-react'
import { Actions } from '../actions'
import configureStore, { history } from '../configureStore'
import { State as ReduxState } from 'types'
import App from './App'

const initialState: Partial<ReduxState> = {}

const store = configureStore(initialState)

store.dispatch(Actions.loadUser())

type State = {
	error: Error | null
}

export default class Root extends React.Component<unknown, State> {
	state: State = {
		error: null
	}

	static getDerivedStateFromError(error: Error) {
		return { error }
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		console.error(error, info)
	}

	render() {
		const { error } = this.state
		if (error !== null && process.env.NODE_ENV !== 'test') {
			return <RedBox error={error} />
		}
		return (
			<MuiThemeProvider>
				<Provider store={store}>
					<ConnectedRouter history={history}>
						<App />
					</ConnectedRouter>
				</Provider>
			</MuiThemeProvider>
		)
	}
}
