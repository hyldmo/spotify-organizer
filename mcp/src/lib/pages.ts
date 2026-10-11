import type { ConsentDescription } from '@cloudflare/workers-oauth-provider'

const STYLE = `
body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #181818; color: #e5e7eb;
	font: 16px/1.5 system-ui, sans-serif; }
main { max-width: 32rem; padding: 2rem; }
h1 { font-size: 1.4rem; line-height: 1.3; }
code { display: block; padding: .75rem; border-radius: .375rem; background: #262626; overflow-wrap: anywhere; }
.muted { color: #9ca3af; }
.warn { padding: .75rem; border-radius: .375rem; background: #422006; color: #fde68a; }
button { margin-right: .5rem; padding: .6rem 1.4rem; border: 0; border-radius: 9999px; font: inherit; font-weight: 600;
	cursor: pointer; background: #16a34a; color: #fff; }
button.secondary { background: #374151; }
`

export function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`)
}

export function html(body: string, status = 200, headers = new Headers()) {
	headers.set('Content-Type', 'text/html; charset=utf-8')
	return new Response(body, { status, headers })
}

function page(title: string, body: string) {
	return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · Spotify Organiser</title>
<style>${STYLE}</style>
<main>${body}</main>
</html>`
}

/** Every string in `details` can come from the client, so all of it is escaped. */
export function consentPage(details: ConsentDescription, handle: string) {
	const name = escapeHtml(details.clientName)
	const publisher = details.clientDomain
		? `Published by <strong>${escapeHtml(details.clientDomain)}</strong>.`
		: 'This app registered itself, so Spotify Organiser cannot confirm its name.'
	const loopback = details.redirectIsLoopback
		? '<p class="warn">Access goes to an app on this computer. Continue only if you started connecting from that app just now.</p>'
		: ''
	return page(
		`Connect ${details.clientName}`,
		`<h1>Let <strong>${name}</strong> use your Spotify account?</h1>
<p class="muted">${publisher}</p>
<p>It will be able to:</p>
<ul>
<li>read your playlists, Liked Songs, recent plays and what is playing</li>
<li>create and edit your playlists, and save or remove items in your library</li>
<li>control playback on your devices</li>
</ul>
<p>Access goes to <strong>${escapeHtml(details.redirectHost)}</strong>.</p>
${loopback}
<p class="muted">Next, you sign in with Spotify.</p>
<form method="post" action="/authorize">
<input type="hidden" name="handle" value="${escapeHtml(handle)}">
<button name="decision" value="allow">Allow</button>
<button name="decision" value="deny" class="secondary">Deny</button>
</form>`
	)
}

export function errorPage(message: string) {
	return page(
		'Could not connect',
		`<h1>Could not connect to Spotify</h1>
<p>${escapeHtml(message)}</p>
<p class="muted">Start again from your AI app.</p>`
	)
}

export function landingPage(origin: string) {
	const url = escapeHtml(`${origin}/mcp`)
	return page(
		'MCP server',
		`<h1>Spotify Organiser MCP server</h1>
<p>Connect Claude, ChatGPT, Cursor or another MCP client to your Spotify account. Add this URL as a custom connector or remote MCP server:</p>
<code>${url}</code>
<p>For Claude Code:</p>
<code>claude mcp add --transport http spotify-organiser ${url}</code>
<p class="muted">Your client opens a browser window. Allow access there, then sign in with Spotify.</p>`
	)
}
