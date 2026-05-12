export function partition<T>(array: T[], size: number): T[][] {
	const chunkList: T[][] = []
	const chunkCount = Math.ceil(array.length / size)
	for (let i = 0; i < chunkCount; i++) {
		chunkList.push(array.splice(0, size))
	}
	return chunkList
}
