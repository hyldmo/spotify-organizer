import modals from './modals'
import playlists from './playlists'
import timer from './timer'
import user from './user'

export const Actions = {
	...modals,
	...playlists,
	...timer,
	...user
}

export type Action = typeof Actions[keyof typeof Actions]
