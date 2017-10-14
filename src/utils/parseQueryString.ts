export function parseQueryString (input: string, hash = false): { [key: string]: string } {
	const queryString = input.split(hash ? '#' : '?')[1]
	const parameters = queryString.split('&')
	const output = {}
	for (const param of parameters) {
		const [key, value] = param.split('=')
		output[decodeURIComponent(key)] = decodeURIComponent(value)
	}
	return output
}
