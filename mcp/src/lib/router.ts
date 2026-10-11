import { catalogRouter } from './routes/catalog'
import { libraryRouter } from './routes/library'
import { playerRouter } from './routes/player'
import { playlistRouter } from './routes/playlist'
import { router } from './trpc'

export const appRouter = router({
	catalog: catalogRouter,
	library: libraryRouter,
	playlist: playlistRouter,
	player: playerRouter
})

export type AppRouter = typeof appRouter
