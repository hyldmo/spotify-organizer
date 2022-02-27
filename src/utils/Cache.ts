import localforage from 'localforage'
import { startCase } from 'lodash/fp'
import { Tuple } from '~/types'

type CacheEntry<T, K = string> = Tuple<K, Readonly<T>>

export class PersistentCache<T, K extends string = string> extends Map<K, Readonly<T>> {
	public id = ''
	private db: LocalForage

	constructor (id: string) {
		super()
		this.id = id
		this.db = localforage.createInstance({
			driver: localforage.INDEXEDDB,
			name: startCase(process.env.PACKAGE_NAME),
			storeName: this.id,
			version: 1
		})
		this.db.ready(err => (err ? console.warn(err) : console.info(`Cache ${id} loaded`)))
		this.loadEntries().then(data => data.forEach(([key, value]) => super.set(key as K, value)))
	}

	public set (key: K, value: T) {
		if (key === null) return this
		super.set(key, value)

		this.db.setItem(key, value).catch(console.warn)
		// As storage APIs does not implement a "getAll", create an entry with all known keys in the cache
		const keys = [...this.keys()].filter(k => k !== 'keys') // Remove that entry's key from it's own list
		this.db.setItem('keys', keys)
		return this
	}

	public getAll (): Array<CacheEntry<T, K>> {
		return [...this.entries()]
	}

	private async loadEntries () {
		const savedKeys = await this.db.getItem<string[]>('keys')
		if (!savedKeys) return []

		const entries = await Promise.all(
			savedKeys.map(async key => {
				const savedData = await this.db.getItem<T>(key)
				return savedData ? [key, savedData] : null
			})
		)

		return entries.filter((e): e is CacheEntry<T> => e !== null)
	}
}
