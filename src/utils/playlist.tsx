import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as React from 'react'
import { Playlist, Sort, User } from '../types'
export function getNextSortMode (isOwn: boolean, order: Sort): Sort {
	if (!isOwn)
		return Sort.Desc

	switch (order) {
		case Sort.Asc:
			return Sort.None
		case Sort.Desc:
			return Sort.Asc
		case Sort.None:
			return Sort.Desc
	}
}

export function getSortIcon (isOwn: boolean, order: Sort) {
	if (!isOwn)
		return null

	switch (order) {
		case Sort.Asc:
			return <FontAwesomeIcon icon="sort-amount-up" />
		case Sort.Desc:
			return <FontAwesomeIcon icon="sort-amount-down" />
		default:
			return null
	}
}

export function canModifyPlaylist (playlist: Playlist, user: User): boolean {
	return playlist.collaborative || playlist.owner.id === user.name
}
