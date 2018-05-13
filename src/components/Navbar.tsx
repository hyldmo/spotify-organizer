import * as React from 'react'
import { Link } from 'react-router-dom'

import { BASE_URL } from '../constants'
import { User } from '../types'

type Props = {
	user: User | null // TODO
}
// TODO: Handle user not having image
const Navbar: React.StatelessComponent<Props> = ({ user }) => (
	<header>
		<nav>
			<ul>
				<li><Link to={BASE_URL}>Home</Link></li>
			</ul>
			{user && (
				<ul>
					<li><img height={20} src={user.image || undefined} /> {user.name}</li>
				</ul>
			)}
		</nav>
	</header>
)
export default Navbar
