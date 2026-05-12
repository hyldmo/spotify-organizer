type QueryStringResult = { [key: string]: string }
export function parseQueryString(input: string, hash = false): QueryStringResult {
	const queryString = input.split(hash ? '#' : '?')[1]
	const parameters = queryString.split('&')
	const output: QueryStringResult = {}
	for (const param of parameters) {
		const [key, value] = param.split('=')
		output[decodeURIComponent(key)] = decodeURIComponent(value)
	}
	return output
}
