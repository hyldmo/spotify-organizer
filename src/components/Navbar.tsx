import * as React from 'react'
import { Link } from 'react-router-dom'

import { BASE_URL } from '../constants'
import { User } from '../types'

import '../styles/navbar.pcss'


type Props = {
	user: User
}

const Navbar: React.StatelessComponent<Props> = ({ user }) => {

	return (
		<header>
			<nav>
				<ul>
					<li><Link to={BASE_URL}>Home</Link></li>
				</ul>
				{user && (
					<ul>
						<li><img height={20} src={user.image} /> {user.name}</li>
					</ul>
				)}
			</nav>
		</header>
	)
}
export default Navbar
