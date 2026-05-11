export const __DEV__ = process.env.NODE_ENV !== 'production'
export const REDIRECT_URI = __DEV__ ? 'http://127.0.0.1:1337' : 'https://spotify-organiser.web.app'
export const CLIENT_ID = '4a3ae815c2a0443c824541a7aa94cfcc'
