import * as React from 'react'
import { replace } from 'react-router-redux'

import { BASE_URL } from '../constants'

export default class ErrorBoundary extends React.Component<any, any> {
	state = {
		hasError: false
	}

	componentDidCatch (error, info) {
		this.setState({ hasError: true })
	}

	render () {
		const { hasError } = this.state
		if (hasError) {
			replace(BASE_URL)
			return false
		}
		return this.props.children
	}
}
