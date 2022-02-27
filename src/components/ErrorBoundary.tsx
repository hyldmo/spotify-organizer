import React from 'react'

export class ErrorBoundary extends React.Component {
	state = {
		hasError: false
	}

	static getDerivedStateFromError () {
		// Update state so the next render will show the fallback UI.
		return { hasError: true }
	}

	componentDidCatch (error: Error, info: React.ErrorInfo) {
		console.error(error, info)
	}

	render () {
		const { hasError } = this.state
		if (hasError) {
			location.reload()
			return null
		}
		return this.props.children as any
	}
}
