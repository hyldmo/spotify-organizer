import reducers from 'reducers'

export interface Tuple<T1, T2> extends Array<any> {
	[0]: T1
	[1]: T2
}

export type User = {
	name: string
	image: string | null
	token: string
}

export enum OperationMode {
	None,
	Duplicates,
	PullTracks
}

export * from './filters'
export * from './modal'
export * from './scopes'
export * from './spotify'

export type State = ReturnType<ReturnType<typeof reducers>>
