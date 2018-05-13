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

export type Action = typeof Actions[keyof typeof Actions]
