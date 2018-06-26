import { FontAwesomeIcon, Props as FaProps } from '@fortawesome/react-fontawesome'
import * as classnames from 'classnames'
import * as React from 'react'

type Props = {
	primary?: boolean
	disabled?: boolean
	icon?: FaProps['icon']
	onClick?: React.MouseEventHandler<HTMLButtonElement>
	title?: HTMLButtonElement['title']
}

const Button: React.StatelessComponent<Props> = ({ primary, disabled, icon, children, onClick, title }) =>  (
	<button className={classnames('button', { primary, disabled })} onClick={e => !disabled && onClick && onClick(e)} title={title}>
		{icon && <FontAwesomeIcon icon={icon} aria-hidden="true" />}
		{icon && children && <span>&nbsp;</span>}
		{children}
	</button>
)

export default Button
