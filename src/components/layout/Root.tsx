import React from 'react'
import { Provider } from 'react-redux'
import { HistoryRouter } from 'redux-first-history/rr6'
import { Actions } from '~/actions'
import { history, store } from '~/configureStore'
import App from './App'

store.dispatch(Actions.loadUser())

type State = {
	error: Error | null
}

export default class Root extends React.Component<unknown, State> {
	state: State = {
		error: null
	}

	static getDerivedStateFromError (error: Error) {
		return { error }
	}

	componentDidCatch (error: Error, info: React.ErrorInfo) {
		console.error(error, info)
	}

	render () {
		const { error } = this.state
		if (error !== null && process.env.NODE_ENV !== 'test') {
			return <div>{JSON.stringify(error)}</div>
		} else {
			return (
				<Provider store={store}>
					<HistoryRouter history={history}>
						<App />
					</HistoryRouter>
				</Provider>
			)
		}
	}
}
