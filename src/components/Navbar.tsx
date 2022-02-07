import React from 'react'
import { Link } from 'react-router-dom'
import { BASE_URL } from '../constants'
import { User } from '../types'

type Props = {
	user: User | null // TODO
}
// TODO: Handle user not having image
const Navbar: React.FC<Props> = ({ user }) => (
	<header className="px-4">
		<nav>
			<ul>
				<li>
					<Link to={BASE_URL}>Home</Link>
				</li>
				<li>
					<Link to={`${BASE_URL}skips`}>Skips</Link>
				</li>
			</ul>
			{user && (
				<ul>
					<li>
						<img className="inline align-bottom h-6 rounded-full" src={user.image || undefined} />{' '}
						{user.name}
					</li>
				</ul>
			)}
		</nav>
	</header>
)
export default Navbar
