/**
 * Returned in the `initialize` handshake, so every connection pays for it. Keep it to the frame and the caveats
 * agents get wrong without being told.
 */
export const MCP_INSTRUCTIONS = `Spotify Organiser works on the signed-in user's Spotify account: playlists, the library (Liked Songs and saved albums) and playback. Results carry Spotify URIs; pass them to other tools.

1. playlist_removeItems removes every occurrence of each URI. Pass snapshotId from playlist_get so the change fails if the playlist changed in the meantime.
2. Playlist positions are 0-based, as listed by playlist_items. Spotify returns playlist contents only to the owner and collaborators.
3. Paged results carry nextOffset while more remain.
4. player_* tools need Spotify Premium and an active device. If one reports no active device, call player_devices and pass a deviceId, or ask the user to open Spotify.`
