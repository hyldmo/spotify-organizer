/* eslint-disable no-restricted-imports */
import { FirebaseOptions, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { get, getDatabase, onValue, ref, update } from 'firebase/database'
import { FirebaseGet, FirebaseUpdates, FirebaseUrls } from '~/types'

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
export const auth = getAuth(app)

export function firebaseWatch<T extends FirebaseUrls> (url: T, onUpdate: (value: FirebaseGet<T>) => void) {
	const key = url.endsWith('/') ? url.slice(0, -1) : url
	const resource = ref(db, key)

	onValue(resource, snapshot => {
		onUpdate(snapshot.val())
	})
}

export async function firebaseGet<T extends FirebaseUrls> (url: T): Promise<FirebaseGet<T> | null> {
	const key = url.endsWith('/') ? url.slice(0, -1) : url
	const res = await get(ref(db, key))
	return res.val()
}

export async function firebaseUpdate<T extends FirebaseUrls> (url: T, value: unknown) {
	const key = url.endsWith('/') ? url.slice(0, -1) : url
	return update(ref(db), { [key]: value })
}

export async function firebaseUpdateMultiple (updates: FirebaseUpdates) {
	return update(ref(db), updates)
}
