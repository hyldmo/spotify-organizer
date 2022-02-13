import React from 'react'
import { OperationMode, Playlist, User } from '../types'
import { CompareType } from './deduplicate'
import { canModifyPlaylist } from './playlist'

export function getDeduplicateErrors(
	mode: OperationMode,
	selectedPlaylists: Playlist[],
	secondPlaylist: Playlist | null,
	user: User
): string | null {
	if (selectedPlaylists.length === 0) return 'You must select a playlist'
	switch (mode) {
		case OperationMode.Duplicates:
			if (selectedPlaylists.some(pl => !canModifyPlaylist(pl, user)))
				return 'You do not have permission to edit one or more of the selected playlists.'
			break
		case OperationMode.PullTracks:
			if (secondPlaylist === null) return 'You must select a second playlist'
			break
	}

	return null
}

export function getCompareTypeExplanation(compareType: CompareType): Exclude<React.ReactNode, undefined> {
	const Mark: React.FC = props => <strong className="not-italic" {...props} />
	switch (compareType) {
		case CompareType.SongId:
			return (
				<>
					Mark songs as duplicate when the other song has the same <Mark>ID</Mark>
				</>
			)

		case CompareType.Name:
			return (
				<>
					Mark songs as duplicate when the other song has the same <Mark>Name</Mark>
				</>
			)

		case CompareType.NameAndAlbum:
			return (
				<>
					Mark songs as duplicate when the other song has the same&nbsp;
					<Mark>Name</Mark> and is from the same <Mark>Album</Mark>
				</>
			)

		case CompareType.NameAndDuration:
			return (
				<>
					Mark songs as duplicate when the other song has the same <Mark>Name</Mark> and <Mark>Length</Mark>
				</>
			)
	}
}
