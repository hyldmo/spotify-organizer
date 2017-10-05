import * as React from 'react'
import Auth from '../containers/Auth'
import PlaylistsManager from '../containers/PlaylistsManager'


const App: React.StatelessComponent = (props) =>  (
	<div>
		<Auth />
		<PlaylistsManager />
	</div>
)

export default App
