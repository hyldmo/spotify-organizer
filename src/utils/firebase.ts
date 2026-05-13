/* eslint-disable no-restricted-imports */
import { type FirebaseOptions, initializeApp } from 'firebase/app'
import { browserLocalPersistence, initializeAuth, inMemoryPersistence, signInAnonymously } from 'firebase/auth'
import { get, getDatabase, onValue, ref, remove, update } from 'firebase/database'
import type { FirebaseGet, FirebaseUpdates, FirebaseUrls } from '~/types'

const PROJECT_ID = process.env.PACKAGE_NAME
const REGION = 'europe-west1'

const firebaseConfig: FirebaseOptions = {
	apiKey: 'AIzaSyCBygCxYG1penqvDbxSoUzHmSXnxtgFF2k',
	projectId: PROJECT_ID,
	databaseURL: `https://${PROJECT_ID}-default-rtdb.${REGION}.firebasedatabase.app/`,
	authDomain: `${PROJECT_ID}.firebaseapp.com`,
	storageBucket: `${PROJECT_ID}.firebasestorage.app`,
	messagingSenderId: '1002656141839',
	appId: '1:1002656141839:web:3babe394f87dea73d0897a',
	measurementId: 'G-8MCL7KX2WV'
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)
// Persistence priority:
//   1. browserLocalPersistence (localStorage) — survives reloads so the
//      anonymous uid is stable across sessions.
//   2. inMemoryPersistence — fallback for browsers/contexts where localStorage
//      is unavailable.
// Deliberately skipping indexedDBLocalPersistence (Firebase's default): its
// firebaseLocalStorageDb can deadlock when held open by another tab/SW.
export const auth = initializeAuth(app, {
	persistence: [browserLocalPersistence, inMemoryPersistence]
})

// Identity model:
//   - Data is keyed by the Spotify user id (stable across logins and devices).
//   - RTDB rules require an authenticated Firebase user whose anon uid maps to
//     that Spotify id via `uidMap/<firebaseUid> = <spotifyId>`.
//   - We write the mapping once per anon uid, which lets the same Spotify
//     identity be reachable from multiple anonymous Firebase sessions.

const RETRY_DELAYS_MS = [500, 1500, 4000, 10000]
let readyPromise: Promise<string | null> | null = null
let cachedFirebaseUid: string | null = null
let pendingSpotifyId: string | null = null

async function attemptAnonymousAuth(): Promise<string | null> {
	for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
		try {
			const result = await signInAnonymously(auth)
			cachedFirebaseUid = result.user.uid
			return cachedFirebaseUid
		} catch (e) {
			const delay = RETRY_DELAYS_MS[attempt]
			if (delay === undefined) {
				console.error('Firebase anonymous auth gave up after retries:', e)
				return null
			}
			console.warn(`Firebase anonymous auth failed (attempt ${attempt + 1}); retrying in ${delay}ms`, e)
			await new Promise(r => setTimeout(r, delay))
		}
	}
	return null
}

async function attemptReady(): Promise<string | null> {
	const fbUid = await attemptAnonymousAuth()
	if (!(fbUid && pendingSpotifyId)) return fbUid
	try {
		await update(ref(db), { [`uidMap/${fbUid}`]: pendingSpotifyId })
	} catch (e) {
		console.error('Failed to write uidMap; user-data RTDB ops will be denied by rules', e)
		return null
	}
	return fbUid
}

// Call before any RTDB user-data op so the uidMap can be written before the op
// is gated by rules. Synchronous and idempotent.
export function setSpotifyId(id: string) {
	if (pendingSpotifyId === id) return
	pendingSpotifyId = id
	// Force a fresh ready cycle so the new mapping is written even if anon
	// auth already completed without a spotify id.
	if (cachedFirebaseUid) readyPromise = null
}

export function ensureFirebaseReady(): Promise<string | null> {
	if (!readyPromise) {
		readyPromise = attemptReady().finally(() => {
			if (!cachedFirebaseUid) readyPromise = null
		})
	}
	return readyPromise
}

export function getFirebaseUid(): string | null {
	return cachedFirebaseUid
}

export function resetFirebaseAuth() {
	cachedFirebaseUid = null
	pendingSpotifyId = null
	readyPromise = null
}

export function firebaseWatch<T extends FirebaseUrls>(url: T, onUpdate: (value: FirebaseGet<T>) => void) {
	const key = url.endsWith('/') ? url.slice(0, -1) : url
	let cancelled = false
	let unsubscribe: (() => void) | null = null

	ensureFirebaseReady().then(uid => {
		if (cancelled || !uid) return
		unsubscribe = onValue(ref(db, key), snapshot => {
			onUpdate(snapshot.val())
		})
	})

	return () => {
		cancelled = true
		if (unsubscribe) unsubscribe()
	}
}

export async function firebaseGet<T extends FirebaseUrls>(url: T): Promise<FirebaseGet<T> | null> {
	const uid = await ensureFirebaseReady()
	if (!uid) return null
	const key = url.endsWith('/') ? url.slice(0, -1) : url
	const res = await get(ref(db, key))
	return res.val()
}

export async function firebaseUpdate<T extends FirebaseUrls>(url: T, value: unknown) {
	const uid = await ensureFirebaseReady()
	if (!uid) return
	const key = url.endsWith('/') ? url.slice(0, -1) : url
	return update(ref(db), { [key]: value })
}

export async function firebaseUpdateMultiple(updates: FirebaseUpdates) {
	const uid = await ensureFirebaseReady()
	if (!uid) return
	return update(ref(db), updates)
}

// One-shot self-migration: if this Firebase anon uid had previously written
// data at users/<firebaseUid>/..., merge it into users/<spotifyId>/... and
// delete the old node. Only rescues data that this browser/device can
// authenticate as — orphaned uids from past inMemoryPersistence sessions
// require the admin script under scripts/migrate-firebase-uids.ts.
export async function migrateLegacyUidData(spotifyId: string): Promise<void> {
	const fbUid = await ensureFirebaseReady()
	if (!fbUid || fbUid === spotifyId) return

	const legacy = await get(ref(db, `users/${fbUid}`))
	const data = legacy.val()
	if (!data) return

	const flat: Record<string, unknown> = {}
	const walk = (node: unknown, path: string[]) => {
		if (node === null || typeof node !== 'object') {
			flat[['users', spotifyId, ...path].join('/')] = node
			return
		}
		for (const [k, v] of Object.entries(node as Record<string, unknown>)) walk(v, [...path, k])
	}
	walk(data, [])

	try {
		await update(ref(db), flat)
		await remove(ref(db, `users/${fbUid}`))
		console.info(`Migrated ${Object.keys(flat).length} legacy fields from users/${fbUid} → users/${spotifyId}`)
	} catch (e) {
		console.warn('Legacy uid migration failed (non-fatal):', e)
	}
}
