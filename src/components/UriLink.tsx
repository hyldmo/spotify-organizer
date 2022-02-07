import React from 'react'

type UriObject = {
	name?: string | null
	uri: string
}

interface Props extends React.HTMLProps<HTMLAnchorElement> {
	object: UriObject
}

export const UriLink: React.FC<Props> = ({ object, children, ...props }) => (
	<a href={object.uri} {...props}>
		{children || object.name || object.uri}
	</a>
)

type ArtistLinksProps = React.HTMLProps<HTMLSpanElement> & {
	artists: Array<UriObject & { id: string }>
}
export const ArtistLinks: React.FC<ArtistLinksProps> = ({ artists, ...props }) => (
	<span {...props}>
		{artists.map((artist, i) => (
			<React.Fragment key={artist.id}>
				<UriLink object={artist} className="opacity-70 hover:opacity-100" href={artist.uri} />
				{i < artists.length - 1 && <span className="opacity-70 pointer-events-none">, </span>}
			</React.Fragment>
		))}
	</span>
)
