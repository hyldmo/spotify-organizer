import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ActionCreator, Actions } from '~/actions'
import { FirebaseGet, FirebaseUrls, Playlist, State } from '~/types'
import { firebaseGet, firebaseWatch } from './firebase'
import { findPlaylist } from './spotify'

export const useAppSelector = useSelector.withTypes<State>()
export const useAppDispatch = useDispatch

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
		// Skip until the URL has a real uid — callers commonly pass
		// `users/${user?.uid}/...` which produces "users/undefined/..." or
		// "users//..." during the brief window before Firebase anon-auth lands.
		if (url.includes('/undefined/') || url.includes('//')) return
		firebaseGet(url).then(setData)
		return firebaseWatch(url, setData)
	}, [url])
	return data
}

export function usePlaylist (id: string): Playlist | undefined {
	const dispatch = useDispatch()
	const playlists = useAppSelector(s => s.playlists)
	const [playlist, setPlaylist] = useState(findPlaylist(id) ?? playlists?.find(pl => pl.id == id))
	useEffect(() => {
		const existing = playlists?.find(pl => pl.id == id)
		const cached = findPlaylist(id)
		if (cached === undefined || cached.tracks.loaded == null) {
			dispatch(Actions.fetchTracks(id))
		} else if (existing?.tracks.lastFetched) {
			setPlaylist(existing)
			return
		}
		const interval = window.setInterval(() => {
			const data = findPlaylist(id)
			if (data?.tracks.lastFetched) {
				window.clearInterval(interval)
				setPlaylist(data)
			}
		}, 300)

		return () => {
			window.clearInterval(interval)
		}
	}, [dispatch, id, playlists])
	return playlist
}
