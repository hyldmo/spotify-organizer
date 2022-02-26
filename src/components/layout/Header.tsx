import { startCase } from 'lodash/fp'
import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { User } from '~/types'
import { UriLink } from '../UriLink'

type Props = {
	user: User | null // TODO
}
// TODO: Handle user not having image
export const Header: React.FC<Props> = ({ user }) => (
	<header className="nav px-4">
		<nav className="grid grid-cols-[auto,1fr,1fr] gap-4 items-center h-full">
			{process.env.PACKAGE_NAME && (
				<ul>
					<li className="text-xl">
						<h1>
							<Link to="/">{startCase(process.env.PACKAGE_NAME)}</Link>
						</h1>
					</li>
				</ul>
			)}
			{user && (
				<>
					<ul className="justify-self-start text-gray-300">
						<>
							<li>
								<NavLink to="/">Playlists</NavLink>
							</li>
							<li>
								<NavLink to="/skips">Skipped songs</NavLink>
							</li>
						</>
					</ul>
					<ul className="justify-self-end">
						<li>
							<UriLink object={user}>
								<img className="inline align-bottom h-6 rounded-full" src={user.image || undefined} />{' '}
								{user.id}
							</UriLink>
						</li>
					</ul>
				</>
			)}
		</nav>
	</header>
)
