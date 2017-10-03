import * as React from 'react'

import '../styles/button.pcss'

type Props = {
	primary?: boolean
	icon?: string
}

const Button: React.StatelessComponent<Props> = ({ primary, icon, children }) =>  (
	<button className={`button ${primary ? 'primary' : ''}`}>
		{icon && <i className={`fa fa-${icon}`} aria-hidden="true" />}
		{icon && children && <span>&nbsp;</span>}
		{children}
	</button>
)

export default Button
