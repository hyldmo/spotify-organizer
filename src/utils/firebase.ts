/* eslint-disable no-restricted-imports */
import { initializeApp } from 'firebase/app'
import { get, getDatabase, ref, update } from 'firebase/database'
import { FirebaseGet, FirebaseUpdates, FirebaseUrls } from 'types'

const PROJECT_ID = process.env.PACKAGE_NAME
const REGION = 'europe-west1'

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
	apiKey: 'API_KEY',
	projectId: PROJECT_ID,
	databaseURL: `https://${PROJECT_ID}-default-rtdb.${REGION}.firebasedatabase.app/`,
	authDomain: `${PROJECT_ID}.firebaseapp.com`,
	storageBucket: `${PROJECT_ID}.appspot.com`,
	messagingSenderId: '1002656141839',
	appId: '1:1002656141839:web:3babe394f87dea73d0897a',
	measurementId: 'G-8MCL7KX2WV'
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export async function firebaseGet<T extends FirebaseUrls>(url: T): Promise<FirebaseGet<T>> {
	const key = url.endsWith('/') ? url.slice(0, -1) : url
	const res = await get(ref(db, key))
	const data = res.toJSON()
	if (data) return data as FirebaseGet<T>
	throw Error()
}

export async function firebaseUpdate<T extends FirebaseUrls>(url: T, value: unknown) {
	const key = url.endsWith('/') ? url.slice(0, -1) : url
	return update(ref(db), { [key]: value })
}

export async function firebaseUpdateMultiple(updates: FirebaseUpdates) {
	return update(ref(db), updates)
}
