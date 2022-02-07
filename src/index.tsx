import fontawesome from '@fortawesome/fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'

fontawesome.library.add(solid)

render(<Root />, document.getElementById('root'))
