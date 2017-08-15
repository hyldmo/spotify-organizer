export enum Scopes {
	PLAYLIST_READ_PRIVATE = 'playlist-read-private', // Read access to user's private playlists.
	PLAYLIST_READ_COLLABORATIVE = 'playlist-read-collaborative', // Include collaborative playlists when requesting a user's playlists.
	PLAYLIST_MODIFY_PUBLIC = 'playlist-modify-public', // Write access to a user's public playlists.
	PLAYLIST_MODIFY_PRIVATE = 'playlist-modify-private', // Write access to a user's private playlists.
	STREAMING = 'streaming', // Control playback of a Spotify track. This scope is currently only available to Spotify native SDKs.
	UGC_IMAGE_UPLOAD = 'ugc-image-upload', // Upload playlist cover image.
	USER_FOLLOW_MODIFY = 'user-follow-modify', // Write/delete access to the list of artists and other users that the user follows.
	USER_FOLLOW_READ = 'user-follow-read', // Read access to the list of artists and other users that the user follows.
	USER_LIBRARY_READ = 'user-library-read', // Read access to a user's "Your Music" library.
	USER_LIBRARY_MODIFY = 'user-library-modify', // Write/delete access to a user's "Your Music" library.
	USER_READ_PRIVATE = 'user-read-private', // Read access to user’s subscription details (type of user account).
	USER_READ_BIRTHDATE = 'user-read-birthdate', // Read access to the user's birthdate.
	USER_READ_EMAIL = 'user-read-email', // Read access to user’s email address.
	USER_TOP_READ = 'user-top-read' // Read access to a user's top artists and tracks
}
