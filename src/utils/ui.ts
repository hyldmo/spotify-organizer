import { OperationMode, Playlist, User } from '../types'
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
