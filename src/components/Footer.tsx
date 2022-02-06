import React from 'react'

const Navbar: React.FC = () => (
	<footer>
		<span>
			<a href={process.env.PACKAGE_REPOSITORY} target="_blank" rel="noreferrer">
				Spotify Organizer v{process.env.PACKAGE_VERSION}
			</a>
		</span>
		<span>
			<a href={`${process.env.PACKAGE_REPOSITORY}/issues/new`} target="_blank" rel="noreferrer">
				Feedback
			</a>
		</span>
	</footer>
)

export default Navbar
