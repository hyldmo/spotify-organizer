import { Component, ErrorInfo, PropsWithChildren } from 'react'

// eslint-disable-next-line @typescript-eslint/ban-types
export interface SilentErrorBoundaryProps extends PropsWithChildren<{}> {
	/**
	 * The fallback component to display when the error boundary catches an error.
	 */
	fallback?: React.ReactNode
	/**
	 * The function that is called when the error boundary catches an error.
	 */
	onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * Error boundary that fails silenty and returns null if a component in its it tree fails
 */
export class SilentErrorBoundary extends Component<SilentErrorBoundaryProps, { error: Error | null }> {
	constructor (props: SilentErrorBoundaryProps) {
		super(props)
		this.state = { error: null }
	}

	static getDerivedStateFromError (error: Error) {
		// Update state so the next render will show the fallback UI.
		return { error }
	}

	componentDidCatch (error: Error, errorInfo: ErrorInfo & Record<string, string>) {
		if (this.props.onError) this.props.onError(error, errorInfo)
		else console.error(error, errorInfo)
		this.setState({ error })
	}

	render () {
		if (this.state.error) {
			return this.props.fallback ?? null
		}

		return this.props.children
	}
}
