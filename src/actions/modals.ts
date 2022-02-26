import { Modal } from '~/types'
import { makeActionCreator } from '~/utils'

export default {
	registerModal: makeActionCreator<Modal['id']>()('MODAL_REGISTER'),
	unregisterModal: makeActionCreator<Modal['id']>()('MODAL_UNREGISTER'),
	changeModal: makeActionCreator<Modal['open'], Modal['id']>()('MODAL_CHANGE')
}
