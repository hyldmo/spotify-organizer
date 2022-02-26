export type Primitive = string | number | symbol | null | undefined

export interface Tuple<T1, T2> extends Array<any> {
	[0]: T1
	[1]: T2
}

export type Optional<T, P extends keyof T> = Omit<T, P> & {
	[K in P]?: T[K]
}

/**
 * Mainly used make sure a type parameter is an object
 */
export type Obj = Record<string, unknown>

export type Selector<T> = (t: T) => unknown

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number]

export type NonNull<T, K = null> = [K] extends [keyof T]
	? { [P in keyof T]: T[P] } & { [P in K]-?: NonNullable<T[P]> }
	: { [P in keyof T]-?: NonNullable<T[P]> }

/**
 * Construct a type with the properties of T & R  but replace overlapping properties from R.
 */
export type Augment<T, R> = Omit<T, keyof R> & R

/**
 * Construct a type with the properties of T & R but replace overlapping properties from R.
 */
export type Replace<T, R> = Omit<T, keyof R> & Pick<R, keyof T extends keyof R ? keyof T : never>

export type ExtractChild<T> = T[keyof T]

export type Nullable<T> = T | null | undefined

/** Is `true` if all properties in T are optional */
export type AreAllOptional<T> = Partial<T> extends T ? true : false

/** Array with at least 0 element */
export type NonEmptyArray<T> = {
	0: T
} & T[]

/** Object with at least one property */
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

/** Exclude empty objects */
export type ExcludeEmpty<T> = T extends AtLeastOne<T> ? T : never

/**
 * Like React.DetailedHTMLProps, except T will replace props found DetailedHTMLProps's props
 */
export type HTMLElementProps<
	E extends keyof JSX.IntrinsicElements = 'main',
	T extends Obj = Record<never, never>
> = Augment<JSX.IntrinsicElements[E], T>
