import localforage from 'localforage'
import { startCase } from 'lodash/fp'
import { Tuple } from '~/types'

type CacheEntry<T, K = string> = Tuple<K, Readonly<T>>

export class PersistentCache<T, K extends string = string> extends Map<K, Readonly<T>> {
	public id = ''
	// Resolves when the in-memory Map has been hydrated from localforage.
	// Callers that decide whether to refetch from network MUST await this; the
	// Map is empty during the constructor's async load and an unguarded read
	// looks indistinguishable from "nothing cached".
	public readonly ready: Promise<void>
	private db: LocalForage
	private pendingKeysWrite: Promise<void> = Promise.resolve()
	private keysWriteScheduled = false

	constructor (id: string) {
		super()
		this.id = id
		this.db = localforage.createInstance({
			name: startCase(process.env.PACKAGE_NAME),
			storeName: this.id,
			version: 1
		})
		this.db.ready(err => (err ? console.warn(err) : console.info(`Cache ${id} loaded`)))
		this.ready = this.loadEntries().then(data => data.forEach(([key, value]) => super.set(key as K, value)))
	}

	public set (key: K, value: T) {
		if (key === null) return this
		const isNewKey = !super.has(key)
		super.set(key, value)

		this.db.setItem(key, value).catch(err => console.warn(`Cache ${this.id}: failed to write key "${key}"`, err))
		// The keys index only changes when a *new* key is added — overwrites
		// (e.g. re-fetching a playlist's tracks) don't touch it. And a burst of
		// inserts (the initial bulk track load can be 100k+) collapses into one
		// debounced write instead of an O(n) serialisation per `set`.
		if (isNewKey) this.scheduleKeysWrite()
		return this
	}

	public getAll (): Array<CacheEntry<T, K>> {
		return [...this.entries()]
	}

	// As storage APIs don't implement "getAll", we persist an explicit index of
	// all known keys. Writes are chained sequentially to prevent concurrent
	// writes from clobbering each other, and debounced so a flood of inserts
	// produces a handful of writes rather than one per key.
	private scheduleKeysWrite () {
		if (this.keysWriteScheduled) return
		this.keysWriteScheduled = true
		this.pendingKeysWrite = this.pendingKeysWrite
			.then(() => this.ready)
			.then(() => new Promise<void>(resolve => setTimeout(resolve, 250)))
			.then(() => {
				this.keysWriteScheduled = false
				const keys = [...this.keys()].filter(k => k !== 'keys')
				return this.db.setItem('keys', keys).then(() => undefined)
			})
			.catch(err => {
				this.keysWriteScheduled = false
				console.warn(`Cache ${this.id}: failed to write keys index`, err)
			})
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
