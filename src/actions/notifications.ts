import { Notification } from '../types'
import { makeActionCreator, makeMetaActionCreator } from '../utils/actionCreator'

export default {
	createNotification: makeActionCreator<Omit<Notification, 'id'> & { id?: Notification['id'] }>()(
		'CREATE_NOTIFICATION'
	),
	__notificationCreated: makeActionCreator<Notification>()('CREATE_NOTIFICATION_SUCCESS'),

	clearNotification: makeMetaActionCreator<Notification['id']>()('CLEAR_NOTIFICATION'),
	clearAllNotifications: makeActionCreator()('CLEAR_ALL_NOTIFICATIONS')
}
