export type Modal = {
	id: string
	open: boolean
}

export type Notification = {
	id: number
	message: React.ReactNode
	type: 'error' | 'warning' | 'success' | 'info'
	progress?: boolean
	duration: number
}
