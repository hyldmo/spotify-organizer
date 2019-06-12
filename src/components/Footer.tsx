import React from 'react'

const Navbar: React.StatelessComponent = (props) =>  (
	<footer>
		<span><a href={process.env.PACKAGE_REPOSITORY} target="_blank">Spotify Organizer v{process.env.PACKAGE_VERSION}</a></span>
		<span><a href={`${process.env.PACKAGE_REPOSITORY}/issues/new`} target="_blank">Feedback</a></span>

	</footer>
)

export default Navbar
