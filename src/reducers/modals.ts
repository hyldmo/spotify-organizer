import { Action, MetaAction } from '~/actions'
import { Modal } from '~/types'

function modal(state: Modal, action: MetaAction): Modal {
	if (action.meta === undefined || state.id !== action.meta) return state

	switch (action.type) {
		case 'MODAL_CHANGE':
			return { ...state, open: action.payload }
		default:
			return state
	}
}

export default function modals(state: Modal[] = [], action: Action): Modal[] {
	switch (action.type) {
		case 'MODAL_REGISTER':
			return [...state, { id: action.payload, open: false }]
		case 'MODAL_UNREGISTER':
			return state.filter(m => m.id !== action.payload)
		case 'MODAL_CHANGE':
			return state.map(m => modal(m, action))
		default:
			return state
	}
}
