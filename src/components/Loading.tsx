import * as React from 'react'

import '../styles/loading.pcss'

const Loading: React.StatelessComponent = () => (
	<div className="loading">
		<i className="fa fa-spinner fa-spin fa-3x fa-fw" />
		<span className="sr-only">Loading...</span>
	</div>
)

export default Loading
