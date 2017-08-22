const __DEV__ = process.env.NODE_ENV !== 'production'

export const BASE_URL = __DEV__ ? '/' : '/spotify-organizer/'
export const REDIRECT_URI = __DEV__ ? 'http://localhost:1337/auth' : `https://eivhyl.github.io${BASE_URL}auth`

