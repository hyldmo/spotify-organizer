import type { FC } from 'react'
import { useSelector } from 'react-redux'
import type { State } from '~/types'

// Aggregate "is the library still being indexed?" pill for the header.
//
// The per-row floppy icon on Playlists already signals which individual
// playlists are cached locally — this is the totals view, so the user can tell
// at a glance whether the background `getAllTracks` cascade is still running
// without scanning the list.
//
// The amber colour matches `$progress` in variables.scss — same "working on
// it" hue used by the login button's pending state, so the visual language is
// consistent across stages of the journey.
export const IndexingStatus: FC = () => {
	const { indexed, total } = useSelector((s: State) => ({
		indexed: s.playlists.filter(p => p.tracks.lastFetched != null).length,
		total: s.playlists.length
	}))

	if (total === 0 || indexed >= total) return null

	return (
		<li
			className="flex items-center gap-1.5 text-sm"
			style={{ color: '#f5a623' }}
			title={`${indexed} of ${total} playlists cached locally`}
			aria-live="polite"
		>
			<i className="fa fa-spinner fa-spin" aria-hidden="true" />
			<span>
				Indexing {indexed}/{total}
			</span>
		</li>
	)
}
