-- Plays and skips the web app records while it watches the user's playback, per playing context
-- (usually a playlist URI) and track.
CREATE TABLE track_stats (
	user_id TEXT NOT NULL,
	context_uri TEXT NOT NULL,
	track_id TEXT NOT NULL,
	plays INTEGER NOT NULL DEFAULT 0,
	skips INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY (user_id, context_uri, track_id)
) WITHOUT ROWID;
