const __DEV__ = process.env.NODE_ENV !== 'production'

export const REDIRECT_URI = __DEV__ ? 'http://localhost:1337/auth' : 'https://eivhyl.github.io/spotify-organizer/'
export const BASE_URL = __DEV__ ? '/' : '/spotify-organizer/'
