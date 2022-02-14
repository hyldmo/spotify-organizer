import * as data from './spotify-organiser-default-rtdb-export.json'
import { set } from 'lodash'
import { writeFileSync } from 'fs'
import path from 'path'

type SkipEntry = {
	plays?: number
	skips?: number
}

function migrate() {
	const plays = data.users.kasserollemodell.plays
	const skips = data.users.kasserollemodell.skips
	for (const [songId, playlists] of Object.entries(data.users.kasserollemodell.songs)) {
		for (const [playlistId, _entry] of Object.entries(playlists)) {
			const entry = _entry as SkipEntry
			if (typeof entry.plays === 'number') {
				const existingPlays = plays[playlistId]?.[songId] || 0
				set(plays, `${playlistId}.${songId}`, existingPlays + entry.plays)
			}
			if (typeof entry.skips === 'number') {
				const existingSkips = skips[playlistId]?.[songId] || 0
				set(skips, `${playlistId}.${songId}`, existingSkips + entry.skips)
			}
		}
	}
	delete (data as any).users.kasserollemodell.songs
	writeFileSync(path.join(__dirname, 'output.json'), JSON.stringify(data, null, '\t'))
}

migrate()
