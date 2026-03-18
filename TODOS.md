# TODOs

## Refactor Home.tsx to hooks
- **What:** Replace `connect(mapStateToProps, dispatchToProps)` + `useSelector` mixed pattern with hooks-only (`useSelector`/`useDispatch`).
- **Why:** Home.tsx is the only component mixing both Redux patterns. New code (Dashboard, Search) uses hooks exclusively — keeping Home.tsx inconsistent is a maintenance trap.
- **Effort:** S
- **Depends on:** Nothing

## Generic 403 (premium required) handling in spotifyFetch
- **What:** Add specific 403 detection in `spotifyFetch` that shows a clear "Spotify Premium required" message instead of a generic error toast.
- **Why:** Free-tier users hitting any premium endpoint get an unhelpful generic error. Currently only playback controls will surface this, but it applies to any premium-gated endpoint.
- **Effort:** S-M
- **Depends on:** Nothing

## Snapshot mismatch retry in batch track deletion
- **What:** When deleting tracks in batches (Skip Surgeon, deduplication), detect snapshot_id mismatch errors, re-fetch the playlist snapshot, and retry the failed batch once.
- **Why:** If a playlist is modified between fetch and delete (e.g., by another device or Spotify itself), some deletions silently fail. The user thinks tracks were removed but they weren't.
- **Effort:** S
- **Depends on:** Skip Surgeon implementation
