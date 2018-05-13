import * as React from 'react'

const Navbar: React.StatelessComponent = (props) =>  (
	<footer>
		<span>Spotify Organizer v{process.env.PACKAGE_VERSION}</span>
	</footer>
)

export default Navbar
