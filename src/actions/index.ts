import modals from './modals'
import playlists from './playlists'
import user from './user'

export const Actions = {
	...modals,
	...playlists,
	...user
}

export type Action = typeof Actions[keyof typeof Actions]
