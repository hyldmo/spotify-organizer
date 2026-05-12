import { toggleSelectionRange } from '../../src/utils'

const rows = ['a', 'b', 'c', 'd', 'e']
const keyAt = (i: number) => rows[i]

it('selects a single row when from === to', () => {
	const result = toggleSelectionRange(new Set(), 2, 2, true, keyAt)
	expect([...result]).toEqual(['c'])
})

it('selects an inclusive forward range', () => {
	const result = toggleSelectionRange(new Set(['a']), 1, 3, true, keyAt)
	expect([...result].sort()).toEqual(['a', 'b', 'c', 'd'])
})

it('selects an inclusive backward range (from > to)', () => {
	const result = toggleSelectionRange(new Set(), 3, 1, true, keyAt)
	expect([...result].sort()).toEqual(['b', 'c', 'd'])
})

it('deselects a range when checked is false', () => {
	const result = toggleSelectionRange(new Set(['a', 'b', 'c', 'd', 'e']), 1, 3, false, keyAt)
	expect([...result].sort()).toEqual(['a', 'e'])
})

it('does not mutate the input set', () => {
	const input = new Set(['a'])
	const result = toggleSelectionRange(input, 1, 2, true, keyAt)
	expect([...input]).toEqual(['a'])
	expect(result).not.toBe(input)
})
