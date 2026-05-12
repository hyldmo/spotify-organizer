import { get } from 'lodash/fp'

export function compareByKey<T>(a: T, b: T, key: string, ascending = true) {
	const invert = ascending ? 1 : -1
	a = get(key, a)
	b = get(key, b)
	if (a < b) return -1 * invert
	if (a > b) return 1 * invert
	return 0
}
