export type Primitive = string | number | symbol | null | undefined

export interface Tuple<T1, T2> extends Array<any> {
	[0]: T1
	[1]: T2
}

export type Nullable<T> = T | null | undefined
