import { Scopes } from './types'
import { urlEscape } from './utils'

export const __DEV__ = process.env.NODE_ENV !== 'production'

export const BASE_URL = __DEV__ ? '/' : '/spotify-organizer/'
export const REDIRECT_URI = __DEV__ ? 'http://localhost:1337' : `https://hyldmo.github.io${BASE_URL}`

const id = '4a3ae815c2a0443c824541a7aa94cfcc'
const scopes = [Scopes.PLAYLIST_READ_PRIVATE, Scopes.PLAYLIST_MODIFY_PRIVATE]
export const loginLink = () =>
	urlEscape`https://accounts.spotify.com/authorize?client_id=${id}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${scopes.join(' ')}&state=${window.location.pathname}`
