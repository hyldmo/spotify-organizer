import { Duration } from '../../src/utils'

function makeMsDuration (days: number, hours = 0, minutes = 0, seconds = 0): number {
	const secondInMs = 1000
	const minuteInMs = secondInMs * 60
	const hourInMs = minuteInMs * 60
	const dayInMs = hourInMs * 24

	return (
		days * dayInMs +
		hours * hourInMs +
		minutes * minuteInMs +
		seconds * secondInMs
	)
}

it('parses 82.423 days to 82 days 10 hours 9 minutes 7 seconds', () => {
	const duration = new Duration(makeMsDuration(82, 10, 9, 7))

	expect(duration.days).toBe(82)
	expect(duration.hours).toBe(10)
	expect(duration.minutes).toBe(9)
	expect(duration.seconds).toBe(7)
})


it('parses 5.6 days to 5 days 14 hours 24 minutes', () => {
	const duration = new Duration(makeMsDuration(5, 14, 24))

	expect(duration.days).toBe(5)
	expect(duration.hours).toBe(14)
	expect(duration.minutes).toBe(24)
	expect(duration.seconds).toBe(0)
})

it('parses 86400000ms to 1 day', () => {
	const duration = new Duration(makeMsDuration(1))

	expect(duration.days).toBe(1)
	expect(duration.hours).toBe(0)
	expect(duration.minutes).toBe(0)
	expect(duration.seconds).toBe(0)
})

it('parses 4.5 hours to 4 hours 30 minutes', () => {
	const duration = new Duration(makeMsDuration(0, 4, 30))

	expect(duration.days).toBe(0)
	expect(duration.hours).toBe(4)
	expect(duration.minutes).toBe(30)
	expect(duration.seconds).toBe(0)
})

it('parses 62000ms to 1 minute 2 seconds', () => {
	const duration = new Duration(makeMsDuration(0, 0, 1, 2))

	expect(duration.days).toBe(0)
	expect(duration.hours).toBe(0)
	expect(duration.minutes).toBe(1)
	expect(duration.seconds).toBe(2)
})

it('parses 1000ms to 1 second', () => {
	const duration = new Duration(1000)

	expect(duration.days).toBe(0)
	expect(duration.hours).toBe(0)
	expect(duration.minutes).toBe(0)
	expect(duration.seconds).toBe(1)
})

it('parses 998ms to 0 seconds', () => {
	const duration = new Duration(998)

	expect(duration.days).toBe(0)
	expect(duration.hours).toBe(0)
	expect(duration.minutes).toBe(0)
	expect(duration.seconds).toBe(0)
})

it('formats 5h 2s correctly', () => {
	const duration = new Duration(makeMsDuration(0, 5, 0, 2))

	expect(duration.toString()).toBe('5 hours 2 seconds')
})

it('formats 82d 10h 2m correctly', () => {
	const duration = new Duration(makeMsDuration(82, 10, 2))

	expect(duration.toString()).toBe('82 days 10 hours 2 minutes')
})

it('does not include empty values in toString()', () => {
	const duration = new Duration(makeMsDuration(0, 4, 30)).toString()

	expect(duration).not.toContain('day')
	expect(duration).not.toContain('second')
})
