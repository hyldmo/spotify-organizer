import { useDispatch } from 'react-redux'
import { ActionCreator } from 'actions'

export function useMapDispatch<T extends Record<string, ActionCreator>>(actions: T): T {
	const dispatch = useDispatch()
	const result: Partial<T> = {}
	for (const [key, value] of Object.entries(actions)) {
		result[key as keyof T] = ((...args: any[]) => dispatch((value as any)(...args))) as any
	}
	return result as T
}
