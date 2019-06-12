import React from 'react'

// tslint:disable-next-line:no-empty-interface
interface Props extends React.HTMLProps<HTMLInputElement> {
	label: string
}

const Input: React.StatelessComponent<Props> = ({ label, ...props }) => (
	<label className={`input ${props.type}`}>
		<input {...props} />
		<span className="label">{label}</span>
	</label>
)

export default Input
