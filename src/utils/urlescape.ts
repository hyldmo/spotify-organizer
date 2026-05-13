export function urlEscape(strings: TemplateStringsArray, ...exps: string[]) {
	let url = ''
	// tslint:disable-next-line:prefer-for-of
	for (let i = 0; i < strings.length; i++) {
		const expression = exps[i] || ''
		url += strings[i] + encodeURIComponent(expression)
	}
	return url
}
