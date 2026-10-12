import type React from 'react'
import { useState } from 'react'

export const Connect: React.FC = () => {
	const url = `${window.location.origin}/mcp`
	const [copied, setCopied] = useState(false)

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(url)
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		} catch {
			setCopied(false)
		}
	}

	return (
		<div className="max-w-2xl p-4">
			<h2 className="mb-2 text-2xl">Connect an AI assistant</h2>
			<p className="mb-4 text-gray-300">
				Claude, ChatGPT, Cursor and other MCP clients can use Spotify Organiser. They can tidy your playlists,
				manage your library, control playback, and find the tracks you skip most.
			</p>
			<div className="mb-4 flex flex-wrap items-center gap-2">
				<code className="rounded bg-gray-800 px-3 py-2">{url}</code>
				<button type="button" className="rounded bg-gray-700 px-3 py-1" onClick={copy}>
					{copied ? 'Copied!' : 'Copy'}
				</button>
			</div>
			<ul className="mb-4 list-disc space-y-1 pl-5 text-gray-300">
				<li>In Claude, add the URL as a custom connector.</li>
				<li>In ChatGPT, Cursor or VS Code, add it as a remote MCP server.</li>
				<li>
					In Claude Code, run <code>claude mcp add --transport http spotify-organiser {url}</code>
				</li>
			</ul>
			<p className="text-gray-400">
				Your assistant opens a browser window. Allow access there, then sign in with Spotify.
			</p>
		</div>
	)
}
