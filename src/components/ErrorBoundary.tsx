import React from 'react'
import { connect } from 'react-redux'
import { push } from 'redux-first-history'
import { State } from '~/types'

const mapStateToProps = (_: State) => ({})

const dispatchToProps = {
	push
}

type Props = typeof dispatchToProps & {
	children?: React.ReactNode
}

class ErrorBoundary extends React.Component<Props> {
	state = {
		hasError: false
	}

	static getDerivedStateFromError() {
		// Update state so the next render will show the fallback UI.
		return { hasError: true }
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		console.error(error, info)
	}

	render() {
		const { hasError } = this.state
		if (hasError) {
			if (location.pathname !== '/') {
				this.props.push('/')
			}
			return null
		}
		return this.props.children as any
	}
}

export default connect(mapStateToProps, dispatchToProps)(ErrorBoundary)
