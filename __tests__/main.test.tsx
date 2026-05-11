import { render } from '@testing-library/react'
import '../__mocks__'
import Root from '../src/components/layout/Root'

it('renders correctly', () => {
	render(<Root />)
})
