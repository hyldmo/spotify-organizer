import * as classnames from 'classnames'
import * as React from 'react'

type Props = {
	primary?: boolean
	disabled?: boolean
	icon?: string
	onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const Button: React.StatelessComponent<Props> = ({ primary, disabled, icon, children, onClick }) =>  (
	<button className={classnames('button', { primary, disabled })} onClick={e => !disabled && onClick && onClick(e)}>
		{icon && <i className={`fa fa-${icon}`} aria-hidden="true" />}
		{icon && children && <span>&nbsp;</span>}
		{children}
	</button>
)

export default Button
