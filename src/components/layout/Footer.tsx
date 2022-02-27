/* eslint-disable max-len */
import React from 'react'
import { NowPlaying } from './NowPlaying'
import { StatusBar } from './StatusBar'

export const Footer: React.FC = () => (
	<footer>
		<NowPlaying />
		<StatusBar />
	</footer>
)
