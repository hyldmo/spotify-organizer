import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clearDiagnostics, type DiagnosticEntry, type DiagnosticLevel, getDiagnostics } from '~/utils/diagnostics'

const levelColor: Record<DiagnosticLevel, string> = {
	info: 'text-gray-400',
	warn: 'text-yellow-400',
	error: 'text-red-400',
	event: 'text-blue-400'
}

function formatTime(t: number) {
	const d = new Date(t)
	return `${d.toLocaleTimeString(undefined, { hour12: false })}.${String(d.getMilliseconds()).padStart(3, '0')}`
}

function gapMs(entries: DiagnosticEntry[], i: number) {
	if (i === 0) return 0
	return entries[i].t - entries[i - 1].t
}

const Debug: React.FC = () => {
	const [entries, setEntries] = useState<DiagnosticEntry[]>(getDiagnostics)
	const [copied, setCopied] = useState(false)

	const refresh = () => setEntries(getDiagnostics())
	const clear = () => {
		clearDiagnostics()
		setEntries([])
	}
	const copy = async () => {
		const text = entries.map(e => `${formatTime(e.t)} [${e.level}] ${e.msg}`).join('\n')
		try {
			await navigator.clipboard.writeText(text)
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		} catch {
			setCopied(false)
		}
	}

	return (
		<div className="p-4 text-sm">
			<div className="mb-3 flex flex-wrap items-center gap-2">
				<Link to="/" className="rounded bg-gray-700 px-3 py-1">
					← Back
				</Link>
				<h2 className="mr-auto font-bold text-lg">Diagnostics ({entries.length})</h2>
				<button type="button" className="rounded bg-gray-700 px-3 py-1" onClick={refresh}>
					Refresh
				</button>
				<button type="button" className="rounded bg-gray-700 px-3 py-1" onClick={copy}>
					{copied ? 'Copied!' : 'Copy all'}
				</button>
				<button type="button" className="rounded bg-red-800 px-3 py-1" onClick={clear}>
					Clear
				</button>
			</div>
			{entries.length === 0 ? (
				<p className="text-gray-400">No diagnostics recorded.</p>
			) : (
				<ol className="space-y-1 font-mono text-xs">
					{entries.map((e, i) => {
						const gap = gapMs(entries, i)
						return (
							<li key={`${e.t}-${i}`} className="border-gray-800 border-b pb-1">
								<span className="text-gray-500">{formatTime(e.t)}</span>{' '}
								{gap >= 500 && <span className="text-orange-400">+{(gap / 1000).toFixed(1)}s </span>}
								<span className={levelColor[e.level]}>[{e.level}]</span>{' '}
								<span className="whitespace-pre-wrap break-words">{e.msg}</span>
							</li>
						)
					})}
				</ol>
			)}
		</div>
	)
}

export default Debug
