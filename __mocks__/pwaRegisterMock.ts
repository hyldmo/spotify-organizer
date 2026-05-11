import { useState } from 'react'

export const useRegisterSW = () => ({
	needRefresh: useState(false),
	offlineReady: useState(false),
	updateServiceWorker: async () => undefined
})
