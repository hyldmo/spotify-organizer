import React from 'react'
import { useLocation } from 'react-router'

const NotFound: React.FC = () => {
	const location = useLocation()

	return (
		<div>
			<h2>
				No match for <code>{location.pathname}</code>
			</h2>
		</div>
	)
}
export default NotFound
