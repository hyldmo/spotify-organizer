export type Primitive = string | number | symbol | null | undefined

export interface Tuple<T1, T2> extends Array<any> {
	[0]: T1
	[1]: T2
}

export type Nullable<T> = T | null | undefined

export type Optional<T, P extends keyof T> = Omit<T, P> & {
	[K in P]?: T[K]
}
