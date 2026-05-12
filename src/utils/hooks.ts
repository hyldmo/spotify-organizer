import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { type ActionCreator, Actions } from '~/actions'
import type { FirebaseGet, FirebaseUrls, Playlist, State } from '~/types'
import { firebaseGet, firebaseWatch } from './firebase'
import { findPlaylist } from './spotify'

export const useAppSelector = useSelector.withTypes<State>()
export const useAppDispatch = useDispatch

export function useMapDispatch<T extends Record<string, ActionCreator>>(actions: T): T {
	const dispatch = useDispatch()
	// Memoised so the bound creators keep stable identities across renders —
	// otherwise every consumer (and any `React.memo` child it forwards them to)
	// re-renders on each parent render. Callers pass a module-constant `actions`
	// object, so an identity check on it is a safe cache key.
	return useMemo(() => {
		const result: Partial<T> = {}
		for (const [key, value] of Object.entries(actions)) {
			result[key as keyof T] = ((...args: any[]) => dispatch((value as any)(...args))) as any
		}
		return result as T
	}, [dispatch, actions])
}

export function useFirebase<T extends FirebaseUrls>(url: T) {
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

export function usePlaylist(id: string): Playlist | undefined {
	const dispatch = useDispatch()
	// Subscribe to just this playlist's slice so the hook re-renders only when
	// _this_ playlist changes, not on every progress event for any playlist.
	const existing = useAppSelector(s => s.playlists?.find(pl => pl.id == id))
	const [playlist, setPlaylist] = useState(() => findPlaylist(id) ?? existing)

	// Dispatch is keyed on id only — every other dep would risk re-dispatching
	// during the load (each FETCH_TRACKS_PROGRESS mutates the playlists ref).
	// The saga dedupes concurrent loads for the same id as defence-in-depth.
	useEffect(() => {
		if (findPlaylist(id) === undefined) {
			dispatch(Actions.fetchTracks(id))
		}
	}, [dispatch, id])

	// Watch for the load to complete. lastFetched flips from null → Date exactly
	// once, so this effect runs at most twice per id (mount + completion).
	useEffect(() => {
		if (existing?.tracks.lastFetched) {
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
		return () => window.clearInterval(interval)
	}, [id, existing?.tracks.lastFetched, existing])

	return playlist
}
