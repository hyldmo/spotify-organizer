import { ArrayElement, Tuple } from '~/types'

export class Duration {
	static units = ['days', 'hours', 'minutes', 'seconds'] as const

	public days: number
	public hours: number
	public minutes: number
	public seconds: number

	constructor(milliseconds: number) {
		const second = 1000
		const minute = second * 60
		const hour = minute * 60
		const day = hour * 24

		// Negate floating point Math.Floor errors
		milliseconds += 1

		this.days = Math.floor(milliseconds / day)
		milliseconds -= this.days * day
		this.hours = Math.floor(milliseconds / hour)
		milliseconds -= this.hours * hour
		this.minutes = Math.floor(milliseconds / minute)
		milliseconds -= this.minutes * minute
		this.seconds = Math.floor(milliseconds / second)
	}

	public toString(upTo?: ArrayElement<typeof Duration.units>): string {
		const values: Array<Tuple<number, string>> = []

		for (const unit of Duration.units) {
			values.push([this[unit], unit.slice(0, -1)])
			if (unit === upTo) break
		}

		return values
			.filter(value => value[0] !== 0)
			.map(([value, unit]) => this.formatUnit(value, unit))
			.join(' ')
	}

	public toMinutesString(): string {
		const minutes = this.days * 24 * 60 + this.hours * 60 + this.minutes

		return `${minutes}:${this.seconds.toString().padStart(2, '0')}`
	}

	private formatUnit(value: number, unit: string): string {
		if (value > 1) return `${value} ${unit}s`
		else return `${value} ${unit}`
	}
}
