import { createAction } from './actionCreator'

const DemoActions = {
	login: createAction<'LOGIN', string>('LOGIN')
}

export default DemoActions
