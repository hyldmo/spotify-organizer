export class Cache<T> extends Map<string, T> {
	key = ''
	constructor(id?: string) {
		super()
		this.key = `_${id}__cache`
		const savedData = localStorage.getItem(this.key)
		if (savedData) {
			Object.entries(JSON.stringify(savedData)).forEach(([key, value]) => super.set(key, value as unknown as T))
		}
	}
	public set(key: string, value: T) {
		super.set(key, value)
		localStorage.setItem(this.key, JSON.stringify([...this.entries()]))
		return this
	}
}
