import { startCase } from 'lodash/fp'
import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { User } from '../types'

type Props = {
	user: User | null // TODO
}
// TODO: Handle user not having image
const Navbar: React.FC<Props> = ({ user }) => (
	<header className="px-4">
		<nav className="grid grid-cols-[auto,1fr,1fr] gap-4">
			{process.env.PACKAGE_NAME && (
				<ul>
					<li>
						<Link to="/">{startCase(process.env.PACKAGE_NAME)}</Link>
					</li>
				</ul>
			)}
			<ul className="justify-self-start">
				{user && (
					<>
						<li>
							<NavLink to="/">Home</NavLink>
						</li>
						<li>
							<NavLink to="/skips">Skips</NavLink>
						</li>
					</>
				)}
			</ul>
			{user && (
				<ul className="justify-self-end">
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
