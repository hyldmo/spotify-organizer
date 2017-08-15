export default function urlEscape (strings: TemplateStringsArray, ...exps: string[]) {
	let url = ''
	// tslint:disable-next-line:prefer-for-of
	for (let i = 0; i < strings.length; i++) {
		url += strings[i] + encodeURIComponent(exps[i])
	}
	return url
}
