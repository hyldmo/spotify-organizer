import { Notification } from '../types'
import { makeActionCreator } from '../utils/actionCreator'

export default {
	createNotification: makeActionCreator<Notification & { duration?: number }>()('CREATE_NOTIFICATION'),
	clearNotification: makeActionCreator()('CLEAR_NOTIFICATION')
}
