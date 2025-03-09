import cn from 'classnames'
import React from 'react'
import { HTMLElementProps } from '~/types'

// tslint:disable-next-line:no-empty-interface
interface Props extends HTMLElementProps<'input'> {
	label: string
	labelClassName?: string
}

const Input: React.FC<Props> = ({ label, labelClassName, ...props }) => (
	<label className={cn('input inline-flex items-center', props.type, labelClassName)}>
		<input {...props} />
		<span className="label">{label}</span>
	</label>
)

export default Input
