import { Tuple } from '../types'

export class Duration {
	public days: number
	public hours: number
	public minutes: number
	public seconds: number

	constructor (milliseconds: number) {
		const second = 1000
		const minute = second * 60
		const hour = minute * 60
		const day = hour * 24

		// Negate floating point Math.Floor errors
		milliseconds += 1

		this.days = Math.floor(milliseconds / day)
		milliseconds -= this.days * day
		this.hours =  Math.floor(milliseconds / hour)
		milliseconds -= this.hours * hour
		this.minutes =  Math.floor(milliseconds / minute)
		milliseconds -= this.minutes * minute
		this.seconds =  Math.floor(milliseconds / second)
	}

	public toString (): string {
		const values: Array<Tuple<number, string>> = [
			[this.days, 'day'],
			[this.hours, 'hour'],
			[this.minutes, 'minute'],
			[this.seconds, 'second']
		]

		return values
			.filter(value => value[0] !== 0)
			.map(([value, unit]) => this.formatUnit(value, unit))
			.join(' ')
	}

	public toMinutesString (): string {
		const minutes = this.days * 24 * 60 + this.hours * 60 + this.minutes

		return `${minutes}:${this.seconds.toString().padStart(2, '0')}`
	}

	private formatUnit (value: number, unit: string): string {
		if (value > 1)
			return `${value} ${unit}s`
		else
			return `${value} ${unit}`
	}
}
