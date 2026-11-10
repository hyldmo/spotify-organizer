/** trackId → count */
export type SongEntries = {
	[id: string]: number
}

/** contextUri → trackId → count */
export type StatCounters = {
	[contextUri: string]: SongEntries
}

export interface TrackStats {
	plays: StatCounters
	skips: StatCounters
}

export interface StatEvent {
	kind: 'play' | 'skip'
	contextUri: string
	trackId: string
}
