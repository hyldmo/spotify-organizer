// tslint:disable-next-line:only-arrow-functions
window.matchMedia =
	window.matchMedia ||
	(() => ({
		media: '',
		matches: false,
		addListener: () => undefined,
		removeListener: () => undefined
	}))

const storageMock: Storage = {
	key: (_index: number) => null,
	getItem: () => '',
	setItem: () => undefined,
	removeItem: () => undefined,
	length: 0,
	clear: () => undefined
}

;(window as any).localStorage = window.localStorage || storageMock
