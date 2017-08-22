import * as _ from 'lodash'

export function compareByKey<T> (a: T, b: T, key: string, ascending = true) {
	const invert = ascending ? 1 : -1
	a = _.get(a, key)
	b = _.get(b, key)
	if (a < b) return -1 * invert
	if (a > b) return 1 * invert
	return 0
}
