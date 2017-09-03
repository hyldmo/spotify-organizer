import * as React from 'react'

import '../styles/input.pcss'

// tslint:disable-next-line:no-empty-interface
interface Props extends React.HTMLProps<HTMLInputElement> {
}

export default class Input extends React.Component<Props> {

	render () {
		return (
			<input {...this.props} />
		)
	}
}
