/** Recursively converts all primitive properties of T to string */
export type ToStringProps<T> = T extends any[]
	? never
	: T extends Record<string, any>
	? { [K in keyof T]: ToStringProps<T[K]> }
	: string

export type PathsToStringProps<T> = T extends string
	? []
	: {
			[K in Extract<keyof T, string>]: [K] | [K, ...PathsToStringProps<T[K]>]
	  }[Extract<keyof T, string>]

export type Join<T extends string[], D extends string> = T extends []
	? never
	: T extends [infer F]
	? F
	: T extends [infer F, ...infer R]
	? F extends string
		? Join<Extract<R, string[]>, D> extends `${string}${D}`
			? `${F}${D}${Join<Extract<R, string[]>, D>}`
			: `${F}${D}${Join<Extract<R, string[]>, D>}${D}`
		: never
	: string

export type Split<T extends string, D extends string> = T extends `${infer F}${D}`
	? [F, ...Split<F, D>]
	: T extends `${infer F}${D}${infer R}`
	? [F, ...Split<R, D>]
	: [T]

export type Traverse<T extends Record<string, any>, K extends string[]> = K extends [infer F]
	? F extends keyof T
		? T[F]
		: never
	: K extends [infer F, ...infer R]
	? F extends keyof T
		? R extends string[]
			? Traverse<T[F], R>
			: never
		: never
	: never
