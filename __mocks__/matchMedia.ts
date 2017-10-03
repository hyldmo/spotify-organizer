// tslint:disable-next-line:only-arrow-functions
window.matchMedia = window.matchMedia || function () {
	return {
		media: '',
		matches: false,
		addListener: () => undefined,
		removeListener: () => undefined
	}
}

const storageMock: Storage = {
	key: null,
	getItem: () => undefined,
	setItem: () => undefined,
	removeItem: () => undefined,
	length: null,
	clear: () => undefined
};

(window as any).localStorage = window.localStorage || storageMock
