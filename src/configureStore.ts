import { createBrowserHistory } from 'history'
import localforage from 'localforage'
import { applyMiddleware, combineReducers, compose, legacy_createStore as createStore } from 'redux'
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

type RootReducer = ReturnType<typeof combineReducers<{ router: typeof routerReducer } & typeof rootReducers>>

const makeReducers = (r: typeof rootReducers) =>
	persistReducer(
		{
			key: `${process.env.PACKAGE_NAME}_redux`,
			storage: localforage,
			whitelist: ['user']
		},
		combineReducers({
			router: routerReducer,
			...r
		}) as any
	)

export const store = createStore(
	makeReducers(rootReducers),
	composeEnhancers(applyMiddleware(...middlewares))
)
export const presistedStore = persistStore(store)

export const history = createReduxHistory(store)

export type State = ReturnType<RootReducer>
// run sagas
SagaManager.startSagas(sagaMiddleware)

if (__DEV__ && import.meta.hot) {
	import.meta.hot.accept('./reducers', newReducers => {
		if (newReducers) store.replaceReducer(makeReducers(newReducers as unknown as typeof rootReducers))
	})

	import.meta.hot.accept('./sagas', newSagaModule => {
		if (newSagaModule) {
			SagaManager.cancelSagas(store as any)
			;(newSagaModule as unknown as { default: typeof SagaManager }).default.startSagas(sagaMiddleware)
		}
	})
}
