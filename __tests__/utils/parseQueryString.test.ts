import { parseQueryString } from '../../src/utils'

it('parses query string without url', () => {
	const url = '?one=1&two=2&three=3'
	const result = parseQueryString(url)

	expect(result).toEqual({
		one: '1',
		two: '2',
		three: '3'
	})
})


it('parses normal url', () => {
	const url = 'https://example.com?one=1&two=2&three=3'
	const result = parseQueryString(url)

	expect(result).toEqual({
		one: '1',
		two: '2',
		three: '3'
	})
})

it('parses spotify url', () => {
	const url = 'https://example.com#one=1&two=2&three=3'
	const result = parseQueryString(url, true)

	expect(result).toEqual({
		one: '1',
		two: '2',
		three: '3'
	})
})
