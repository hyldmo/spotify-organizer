/* eslint-disable max-len */
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '~/types'
import { NowPlaying } from './NowPlaying'
import { StatusBar } from './StatusBar'

export const Footer: React.FC = () => {
	const dispatch = useDispatch()
	const playback = useSelector((s: State) => s.playback.nowPlaying)

	return (
		<footer>
			<NowPlaying />
			<StatusBar playback={playback} />
		</footer>
	)
}
