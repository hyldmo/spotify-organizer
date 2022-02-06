import { FilterActions, GetMetaActions } from 'utils'
import modals from './modals'
import notifications from './notifications'
import playlists from './playlists'
import timer from './timer'
import user from './user'

export const Actions = {
	...modals,
	...notifications,
	...playlists,
	...timer,
	...user
}

export type ActionCreator = typeof Actions[keyof typeof Actions]
type A = ReturnType<ActionCreator>

export type Action<TKey extends ActionTypes = any, TAction extends A = A> = TAction extends { type: TKey }
	? TAction
	: never

export type ErrorAction = FilterActions<Action, 'ERROR'>
export type SuccessAction = FilterActions<Action, 'SUCCESS'>

export type MetaAction = GetMetaActions<Action>
export type ActionTypes = Action['type']

export type AnyAction = {
	[extraProps: string]: any
	type: ActionTypes
}
