import { Notification } from '../types'
import { createAction } from './actionCreator'

export default {
	createNotification: createAction<'CREATE_NOTIFICATION', Notification & { duration?: number }>(
		'CREATE_NOTIFICATION'
	),
	clearNotification: createAction<'CLEAR_NOTIFICATION'>('CLEAR_NOTIFICATION')
}
