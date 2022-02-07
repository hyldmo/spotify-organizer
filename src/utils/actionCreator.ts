/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable max-len */

// TODO: C type parameters doesn't work with unions, making them all unknown
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type EmptyAction<T, C extends Record<string, any>> = { type: T; '@CONTEXT'?: Record<string, any> }
type EmptyActionCreator<T, C = never> = () => EmptyAction<T, C>
type ActionPayloadCreator<T, P, C = never> = (payload: P) => EmptyAction<T, C> & { payload: P }
type ActionMetaCreator<T, P, M, C = never> = (payload: P, meta: M) => EmptyAction<T, C> & { payload: P; meta: M }
type ActionMetaOnlyCreator<T, M, C = never> = (meta: M) => EmptyAction<T, C> & { meta: M }

type Never = null

// prettier-ignore
export const makeActionCreator = <P = Never, M = Never>() => <T extends string, C>(type: T, context?: C):
	{ type: T } &
	([M] extends [Never]
		? ([P] extends [Never]
			? EmptyActionCreator<T, C>
			: ActionPayloadCreator<T, P, C>)
		: ActionMetaCreator<T, P, M, C>) =>
{
	const action = (payload?: P, meta?: M) => ({
		type,
		payload,
		meta,
		'@CONTEXT': context
	})
	action.type = type
	return action as any
}

// prettier-ignore
export const makeMetaActionCreator = <M>() => <T extends string, C>(type: T, context?: C):
	{ type: T } & ActionMetaOnlyCreator<T, M, C> => {
	const action = (meta: M) => ({
		type,
		meta,
		'@CONTEXT': context
	})

	action.type = type
	return action as any
}

export type GetMetaActions<T> = T extends { meta: any } ? T : never

export type FilterActions<TAction extends { type: string }, TKey extends string> = TAction extends {
	type: `${string}${TKey}${string}`
}
	? TAction
	: never
