export type Modal = {
	id: string
	open: boolean
}

export type Notification = {
	id: number
	message: React.ReactNode
	progress?: boolean
	duration?: number
}
