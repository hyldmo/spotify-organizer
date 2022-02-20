import localforage from 'localforage'
import { snakeCase, startCase } from 'lodash/fp'
import { Tuple } from 'types'

type CacheEntry<T, K = string> = Tuple<K, Readonly<T>>

const cacheKey = (id: string) => `${id}_cache_`

const db = localforage.createInstance({
	driver: localforage.INDEXEDDB,
	name: startCase(process.env.PACKAGE_NAME),
	storeName: snakeCase(process.env.PACKAGE_NAME)
})

export class PersistentCache<T, K extends string = string> extends Map<K, Readonly<T>> {
	public key = ''
	public id = ''

	constructor(id: string) {
		super()
		this.id = id
		this.key = cacheKey(this.id)
		PersistentCache.loadEntries<T>(this.id).then(data => data.forEach(([key, value]) => super.set(key as K, value)))
	}

	static async getAll<T>(id: string) {
		return PersistentCache.loadEntries<T>(id)
	}

	static async getByCacheIdAndKey<T>(id: string, entryKey: string) {
		return db.getItem<T>(cacheKey(id) + entryKey)
	}

	private static async loadEntries<T>(id: string) {
		const key = cacheKey(id)
		const savedKeys = await db.getItem<string[]>(cacheKey(id))
		if (!savedKeys) return []

		const entries = await Promise.all(
			savedKeys.map(async saveKey => {
				const savedData = await db.getItem<T>(key + saveKey)
				return savedData ? [key, savedData] : null
			})
		)

		return entries.filter((e): e is CacheEntry<T> => e !== null)
	}

	public set(key: K, value: T) {
		super.set(key, value)

		db.setItem(this.key + key, value)
		// As storage APIs does not implement a "getAll", create an entry with all keys in the cache
		const keys = [...this.keys()].filter(k => k !== this.key) // Remove that entry's key from it's own list
		db.setItem(this.key, keys)
		return this
	}

	public getAll(): Array<CacheEntry<T, K>> {
		return [...this.entries()]
	}
}
