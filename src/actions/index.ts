import user from './user'

export const Actions = {
	...user
}

export type Action = typeof Actions[keyof typeof Actions]
