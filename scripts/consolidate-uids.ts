/* eslint-disable no-console */

// Offline migration to recover plays/skips from past Firebase anonymous uids.
//
// Background: before commit 531be69 we used Firebase Auth's IndexedDB
// persistence, which deadlocked. The deadlock fix switched to
// inMemoryPersistence, which mints a NEW anonymous uid on every reload —
// scattering plays/skips across many `users/<anonUid>/...` buckets that the
// new persistence/identity model can no longer reach from the client.
//
// This script takes an export of the `/users` subtree from the Firebase
// console, merges every anon-uid bucket's plays+skips counters into a single
// target bucket (your Spotify user id), and writes back a JSON file you can
// re-import into Firebase. Plays and skips for the same (playlistUri, songId)
// are summed.
//
// Usage:
//   1. In the Firebase console (Realtime Database → /users node), click ⋮ →
//      "Export JSON". Save as scripts/users-export.json.
//   2. yarn ts-node scripts/consolidate-uids.ts <yourSpotifyUserId>
//   3. Upload scripts/users-merged.json back to /users via "Import JSON".
//
// The script does NOT touch the live database directly — it's a pure JSON
// transform so you can review the diff before importing.

import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

type Counters = Record<string, Record<string, number>> // contextUri -> songId -> count
type UserBucket = { plays?: Counters; skips?: Counters; [k: string]: unknown }

function mergeCounters (into: Counters, from: Counters | undefined) {
	if (!from) return
	for (const [ctx, songs] of Object.entries(from)) {
		if (!songs || typeof songs !== 'object') continue
		into[ctx] = into[ctx] || {}
		for (const [song, count] of Object.entries(songs)) {
			const n = Number(count)
			if (Number.isFinite(n)) into[ctx][song] = (into[ctx][song] || 0) + n
		}
	}
}

function main () {
	const target = process.argv[2]
	if (!target) {
		console.error('Usage: ts-node scripts/consolidate-uids.ts <spotifyUserId>')
		process.exit(1)
	}

	const inputPath = path.join(__dirname, 'users-export.json')
	const outputPath = path.join(__dirname, 'users-merged.json')

	const raw = JSON.parse(readFileSync(inputPath, 'utf8')) as Record<string, UserBucket>

	const merged: UserBucket = { plays: {}, skips: {} }
	const sourceKeys = Object.keys(raw)

	for (const key of sourceKeys) {
		const bucket = raw[key]
		if (!bucket || typeof bucket !== 'object') continue
		mergeCounters(merged.plays as Counters, bucket.plays as Counters | undefined)
		mergeCounters(merged.skips as Counters, bucket.skips as Counters | undefined)
		// Preserve unknown fields from the target bucket itself
		if (key === target) {
			for (const [k, v] of Object.entries(bucket)) {
				if (k !== 'plays' && k !== 'skips') merged[k] = v
			}
		}
	}

	const out: Record<string, UserBucket> = { [target]: merged }
	writeFileSync(outputPath, JSON.stringify(out, null, '\t'))

	const playCtxs = Object.keys(merged.plays || {}).length
	const skipCtxs = Object.keys(merged.skips || {}).length
	console.log(`Merged ${sourceKeys.length} source buckets → users/${target}`)
	console.log(`  plays: ${playCtxs} playlist contexts`)
	console.log(`  skips: ${skipCtxs} playlist contexts`)
	console.log(`Output: ${outputPath}`)
	console.log('Next: upload via Firebase console → Realtime Database → /users → ⋮ → "Import JSON".')
}

main()
