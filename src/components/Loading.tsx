import React from 'react'

type Props = {
	progress?: {
		current: number
		total: number
	}
}

const Loading: React.FC<Props> = ({ progress }) => (
	<div className="loading">
		<div className="spinner">
			<i className="fa fa-spinner fa-spin fa-3x fa-fw" />
			<span className="sr-only">Loading...</span>
		</div>
		{progress && <div className="percentage">{Math.floor((progress.current / progress.total) * 100)}%</div>}
	</div>
)

export default Loading
