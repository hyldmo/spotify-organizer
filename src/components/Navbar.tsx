import * as React from 'react'
import { Link } from 'react-router-dom'

import '../styles/navbar.pcss'

const Navbar: React.StatelessComponent = () => {
	const id = '23fa3801c8db4a6fa3912a8033ec3b2e'
	const uri =  encodeURIComponent('http://localhost:1337/auth')
	const loginLink = `https://accounts.spotify.com/authorize?client_id=${id}&response_type=code&redirect_uri=${uri}`
	return (
		<header>
			<nav>
				<ul>
					<li><Link to="/">Home</Link></li>
					<li><a href={loginLink} target="blank">Login</a></li>
				</ul>
			</nav>
		</header>
	)
}
export default Navbar
