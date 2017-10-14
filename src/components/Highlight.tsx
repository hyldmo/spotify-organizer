// Based on react-highlight-words by https://github.com/bvaughn
import * as React from 'react'

type Props = {
	text: string,
	term: string
}

const Highlight: React.StatelessComponent<Props> = ({ text, term }) => {
	const chunks = highlightSuggestion(text, term)
	return (
		<span>
			{chunks.map(chunk => {
				if (chunk.highlighted)
					return <span className="highlighted" key={chunk.text}>{chunk.text}</span>
				else
					return chunk.text
			})}
		</span>
	)
}
export default Highlight

class Chunk {
	highlighted: boolean
	text: any

	constructor (text: string, isHighlighed = false) {
		this.text = text
		this.highlighted = isHighlighed
	}
}

function highlightSuggestion (suggestion = '', query = ''): Chunk[] {
	const terms = query.toLowerCase().split(' ')
	const chunks = new Array<Chunk>(terms.length)

	if (suggestion.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) === -1) {
		return [new Chunk(suggestion, false)]
	}

	let lastIndex = 0
	let newIndex = 0
	for (const term of terms) {
		newIndex = suggestion.toLowerCase().indexOf(term, lastIndex)
		chunks.push(new Chunk(suggestion.substr(lastIndex, newIndex - lastIndex), false))
		lastIndex = newIndex + term.length
		chunks.push(new Chunk(suggestion.substr(newIndex, term.length), true))
	}
	chunks.push(new Chunk(suggestion.substr(lastIndex, suggestion.length), false))

	return chunks
}
