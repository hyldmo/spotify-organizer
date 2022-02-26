import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { ActionCreator } from '~/actions'
import { FirebaseGet, FirebaseUrls } from '~/types'
import { firebaseGet, firebaseWatch } from './firebase'

export function useMapDispatch<T extends Record<string, ActionCreator>> (actions: T): T {
	const dispatch = useDispatch()
	const result: Partial<T> = {}
	for (const [key, value] of Object.entries(actions)) {
		result[key as keyof T] = ((...args: any[]) => dispatch((value as any)(...args))) as any
	}
	return result as T
}

export function useFirebase<T extends FirebaseUrls> (url: T) {
	const [data, setData] = useState<FirebaseGet<T> | null>(null)
	useEffect(() => {
		firebaseGet(url).then(setData)
		firebaseWatch(url, setData)
	}, [url])
	return data
}
