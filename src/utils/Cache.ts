import { Tuple } from 'types'

export class ImmutableCache<T> extends Map<string, Readonly<T>> {
	key = ''
	id = ''
	constructor(_id: string) {
		super()
		this.id = _id
		this.key = `_${this.id}__cache`
		const savedData = localStorage.getItem(this.key)
		if (savedData) {
			const data: Array<Tuple<string, Readonly<T>>> = JSON.parse(savedData)
			data.forEach(([key, value]) => super.set(key, value))
		}
	}
	public set(key: string, value: T) {
		super.set(key, value)
		localStorage.setItem(this.key, JSON.stringify([...this.entries()]))
		return new ImmutableCache<T>(this.id) as this
	}

	public getAll(): Array<Tuple<string, Readonly<T>>> {
		return [...this.entries()]
	}
}
