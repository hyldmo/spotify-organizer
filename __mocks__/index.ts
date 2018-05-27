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
	key: (index: number) => null,
	getItem: () => '',
	setItem: () => undefined,
	removeItem: () => undefined,
	length: 0,
	clear: () => undefined
};

(window as any).localStorage = window.localStorage || storageMock
