import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { createRoot } from 'react-dom/client'
import Root from './components/layout/Root'

library.add(fas)

const container = document.getElementById('root')
if (container) {
	createRoot(container).render(<Root />)
}
