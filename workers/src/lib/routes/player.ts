import { z } from 'zod'
import { duration, type SpotifyItem, type SpotifyTrack, toItem } from '../shapes'
import { protectedProcedure, router } from '../trpc'

interface SpotifyDevice {
	id: string | null
	name: string
	type: string
	is_active: boolean
	volume_percent: number | null
}

interface SpotifyPlayback {
	device: SpotifyDevice
	is_playing: boolean
	progress_ms: number | null
	shuffle_state: boolean
	repeat_state: string
	item: SpotifyItem | null
	context: { uri: string } | null
}

const deviceId = z.string().optional().describe('Device ID from player_devices. Omit to use the active device.')

function toDevice(device: SpotifyDevice) {
	return {
		id: device.id,
		name: device.name,
		type: device.type,
		active: device.is_active,
		volume: device.volume_percent
	}
}

export const playerRouter = router({
	state: protectedProcedure
		.meta({ description: 'Show what is playing: the item, progress, device, shuffle, repeat and context.' })
		.query(async ({ ctx }) => {
			const state = await ctx.spotify.get<SpotifyPlayback | undefined>('me/player')
			if (!state) return { active: false }
			return {
				active: true,
				playing: state.is_playing,
				item: toItem(state.item),
				progress: state.progress_ms === null ? undefined : duration(state.progress_ms),
				device: toDevice(state.device),
				shuffle: state.shuffle_state,
				repeat: state.repeat_state,
				context: state.context?.uri
			}
		}),

	queue: protectedProcedure
		.meta({ description: 'Show the current item and what plays next.' })
		.input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
		.query(async ({ ctx, input }) => {
			const { currently_playing, queue } = await ctx.spotify.get<{
				currently_playing: SpotifyItem | null
				queue: SpotifyItem[]
			}>('me/player/queue')
			return {
				current: currently_playing && toItem(currently_playing),
				next: queue.slice(0, input.limit).map(toItem)
			}
		}),

	devices: protectedProcedure
		.meta({ description: 'List the Spotify Connect devices the user can play on.' })
		.query(async ({ ctx }) => {
			const { devices } = await ctx.spotify.get<{ devices: SpotifyDevice[] }>('me/player/devices')
			return devices.map(toDevice)
		}),

	recentlyPlayed: protectedProcedure
		.meta({ description: 'List tracks the user played recently, newest first.' })
		.input(z.object({ limit: z.number().int().min(1).max(50).default(20) }))
		.query(async ({ ctx, input }) => {
			const { items } = await ctx.spotify.get<{ items: { track: SpotifyTrack; played_at: string }[] }>(
				'me/player/recently-played',
				{ limit: input.limit }
			)
			return items.map(({ track, played_at }) => ({ ...toItem(track), playedAt: played_at }))
		}),

	play: protectedProcedure
		.meta({
			description:
				'Start playback. A track or episode URI plays that item. An album, artist, playlist or show URI plays it from the start. Without a URI, playback resumes.'
		})
		.input(
			z.object({
				uri: z
					.string()
					.regex(/^spotify:(track|episode|album|artist|playlist|show):[0-9A-Za-z]+$/)
					.optional(),
				deviceId
			})
		)
		.mutation(({ ctx, input }) => {
			const body = !input.uri
				? undefined
				: /^spotify:(track|episode):/.test(input.uri)
					? { uris: [input.uri] }
					: { context_uri: input.uri }
			return ctx.spotify.put<void>('me/player/play', { device_id: input.deviceId }, body)
		}),

	pause: protectedProcedure
		.meta({ description: 'Pause playback.', idempotent: true })
		.input(z.object({ deviceId }))
		.mutation(({ ctx, input }) => ctx.spotify.put<void>('me/player/pause', { device_id: input.deviceId })),

	skip: protectedProcedure
		.meta({ description: 'Skip to the next or previous item.' })
		.input(z.object({ direction: z.enum(['next', 'previous']).default('next'), deviceId }))
		.mutation(({ ctx, input }) =>
			ctx.spotify.post<void>(`me/player/${input.direction}`, { device_id: input.deviceId })
		),

	addToQueue: protectedProcedure
		.meta({ description: 'Add a track or episode to the end of the playback queue.' })
		.input(z.object({ uri: z.string().regex(/^spotify:(track|episode):[0-9A-Za-z]+$/), deviceId }))
		.mutation(({ ctx, input }) =>
			ctx.spotify.post<void>('me/player/queue', { uri: input.uri, device_id: input.deviceId })
		),

	setVolume: protectedProcedure
		.meta({ description: 'Set the playback volume.' })
		.input(z.object({ volumePercent: z.number().int().min(0).max(100), deviceId }))
		.mutation(({ ctx, input }) =>
			ctx.spotify.put<void>('me/player/volume', {
				volume_percent: input.volumePercent,
				device_id: input.deviceId
			})
		),

	setShuffle: protectedProcedure
		.meta({ description: 'Turn shuffle on or off.' })
		.input(z.object({ shuffle: z.boolean(), deviceId }))
		.mutation(({ ctx, input }) =>
			ctx.spotify.put<void>('me/player/shuffle', { state: input.shuffle, device_id: input.deviceId })
		),

	setRepeat: protectedProcedure
		.meta({ description: 'Repeat the current track, repeat the current album or playlist, or turn repeat off.' })
		.input(z.object({ mode: z.enum(['track', 'context', 'off']), deviceId }))
		.mutation(({ ctx, input }) =>
			ctx.spotify.put<void>('me/player/repeat', { state: input.mode, device_id: input.deviceId })
		),

	transfer: protectedProcedure
		.meta({ description: 'Move playback to another device.', idempotent: true })
		.input(
			z.object({
				deviceId: z.string().describe('Device ID from player_devices'),
				play: z.boolean().default(true).describe('Start playing on the new device')
			})
		)
		.mutation(({ ctx, input }) =>
			ctx.spotify.put<void>('me/player', undefined, { device_ids: [input.deviceId], play: input.play })
		)
})
