import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { createRoot } from 'react-dom/client'
import Root from './components/layout/Root'
import { installDiagnostics } from './utils/diagnostics'

// Install before anything else so the console tee + global error handlers
// capture the whole open sequence (auth, cache hydration, playlist load).
installDiagnostics()

library.add(fas)

const container = document.getElementById('root')
if (container) {
	createRoot(container).render(<Root />)
}
