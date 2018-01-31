import * as React from 'react'

type Props = {
	primary?: boolean
	icon?: string
	onClick?: () => void
}

const Button: React.StatelessComponent<Props> = ({ primary, icon, children, onClick }) =>  (
	<button className={`button ${primary ? 'primary' : ''}`} onClick={onClick}>
		{icon && <i className={`fa fa-${icon}`} aria-hidden="true" />}
		{icon && children && <span>&nbsp;</span>}
		{children}
	</button>
)

export default Button
