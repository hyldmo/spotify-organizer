// In-PWA diagnostics. There are no devtools in an installed PWA, and a lot of
// the app's failure paths only `console.warn`/`console.error` (refresh-token
// transient failures, firebase retries, cache write errors, swallowed saga
// errors). This tees those plus `console.info` milestones into a bounded ring
// buffer persisted to localStorage, and catches global `error` /
// `unhandledrejection` events. Read it at /debug — that route renders even when
// unauthenticated, so it's reachable when the open/auth sequence itself hangs.

const STORAGE_KEY = 'diagnostics_log'
const MAX_ENTRIES = 300

export type DiagnosticLevel = 'info' | 'warn' | 'error' | 'event'

export interface DiagnosticEntry {
	t: number
	level: DiagnosticLevel
	msg: string
}

let buffer: DiagnosticEntry[] | null = null
let flushScheduled = false
// Guards against re-entrancy: our flush failure handler must never feed itself.
let inLog = false

const original = {
	info: console.info.bind(console),
	warn: console.warn.bind(console),
	error: console.error.bind(console)
}

function load(): DiagnosticEntry[] {
	if (buffer) return buffer
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		buffer = raw ? (JSON.parse(raw) as DiagnosticEntry[]) : []
	} catch {
		buffer = []
	}
	return buffer
}

function flush() {
	flushScheduled = false
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(buffer ?? []))
	} catch {
		// Quota or serialization failure — drop silently; never recurse into logging.
	}
}

function scheduleFlush() {
	if (flushScheduled) return
	flushScheduled = true
	setTimeout(flush, 250)
}

function serialize(arg: unknown): string {
	if (typeof arg === 'string') return arg
	if (arg instanceof Error) return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ''}`
	try {
		return JSON.stringify(arg)
	} catch {
		return String(arg)
	}
}

export function logDiagnostic(level: DiagnosticLevel, args: unknown[]) {
	if (inLog) return
	inLog = true
	try {
		const entries = load()
		entries.push({ t: Date.now(), level, msg: args.map(serialize).join(' ') })
		if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES)
		scheduleFlush()
	} catch {
		// Never let diagnostics break the app.
	} finally {
		inLog = false
	}
}

export function getDiagnostics(): DiagnosticEntry[] {
	return [...load()]
}

export function clearDiagnostics() {
	buffer = []
	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch {
		// Ignore storage errors — the in-memory buffer is already cleared.
	}
}

let installed = false

export function installDiagnostics() {
	if (installed) return
	installed = true

	console.info = (...args: unknown[]) => {
		logDiagnostic('info', args)
		original.info(...args)
	}
	console.warn = (...args: unknown[]) => {
		logDiagnostic('warn', args)
		original.warn(...args)
	}
	console.error = (...args: unknown[]) => {
		logDiagnostic('error', args)
		original.error(...args)
	}

	window.addEventListener('error', e => {
		logDiagnostic('event', [
			`window.onerror: ${e.message}`,
			e.filename ? `@ ${e.filename}:${e.lineno}:${e.colno}` : ''
		])
	})
	window.addEventListener('unhandledrejection', e => {
		logDiagnostic('event', ['unhandledrejection:', e.reason])
	})

	// Persist promptly when the app is backgrounded/closed so a hang-then-kill
	// (common on iOS PWAs) doesn't lose the last few entries.
	const sync = () => {
		if (flushScheduled) flush()
	}
	window.addEventListener('pagehide', sync)
	window.addEventListener('beforeunload', sync)
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') sync()
	})

	logDiagnostic('event', [`diagnostics installed — ${new Date().toISOString()}`])
}
