import * as React from 'react'
import Auth from '../containers/Auth'
import Playlists from '../containers/Playlists'


const App: React.StatelessComponent = (props) =>  (
	<div>
		<Auth />
		<Playlists />
	</div>
)

export default App
