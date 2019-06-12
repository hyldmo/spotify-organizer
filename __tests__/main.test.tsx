import React from 'react'
import renderer from 'react-test-renderer'
import '../__mocks__'
import Root from '../src/containers/Root'

it('renders correctly', () => {
	renderer
		.create(<Root />)
		.toJSON()
	// TODO: Turn on snapshot testing
	// expect(tree).toMatchSnapshot()
})
