import { createBrowserHistory } from 'history'
import localforage from 'localforage'
import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import { createReduxHistoryContext } from 'redux-first-history'
import { persistReducer, persistStore } from 'redux-persist'
import createSagaMiddleware from 'redux-saga'
import * as rootReducers from './reducers'
import SagaManager from './sagas'

const __DEV__ = process.env.NODE_ENV === 'development'
const sagaMiddleware = createSagaMiddleware()

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({
	history: createBrowserHistory()
})

const middlewares = [sagaMiddleware, routerMiddleware]

const composeEnhancers = __DEV__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose : compose

const reducers = (r: typeof rootReducers) =>
	persistReducer(
		{
			key: `${process.env.PACKAGE_NAME}_redux`,
			storage: localforage,
			whitelist: ['user']
		},
		combineReducers({
			router: routerReducer,
			...r
		})
	)

export const initialState = {}
export const store = createStore(
	reducers(rootReducers),
	initialState,
	composeEnhancers(applyMiddleware(...middlewares))
)
export const presistedStore = persistStore(store)

export const history = createReduxHistory(store)

export type State = ReturnType<ReturnType<typeof reducers>>
// run sagas
SagaManager.startSagas(sagaMiddleware)

if (__DEV__ && module.hot) {
	// Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
	module.hot.accept('./reducers', async () => {
		const newReducers = await import('./reducers')
		store.replaceReducer(reducers(newReducers))
	})

	module.hot.accept('./sagas', async () => {
		const newSagaManager = await import('./sagas')
		SagaManager.cancelSagas(store as any)
		newSagaManager.default.startSagas(sagaMiddleware)
	})
}
