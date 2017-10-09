export function durationString (milliseconds: number): string {
	const date = new Date(milliseconds)
	const days = date.getDay()
	const hours = date.getHours()
	const minutes = date.getMinutes()
	return `${days} days ${hours} hours ${minutes} minutes`
}
