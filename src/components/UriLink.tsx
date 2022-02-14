import React from 'react'
import { Link } from 'react-router-dom'
import { Nullable, URI, UriObject } from 'types'
import { isUriType, UriToId } from 'utils'

interface Props extends React.HTMLProps<HTMLAnchorElement> {
	object: Nullable<UriObject>
}

export const UriLink: React.FC<Props> = ({ object, children, ...props }) => {
	const childNode = children || object?.name || object?.display_name || object?.uri
	if (isUriType(object, 'playlist')) {
		return (
			<Link to={`/playlists/${UriToId(object.uri as URI)}`} {...(props as any)}>
				{childNode}
			</Link>
		)
	}

	return (
		<a href={object?.uri} {...props}>
			{childNode}
		</a>
	)
}

type ArtistLinksProps = React.HTMLProps<HTMLSpanElement> & {
	artists: Array<UriObject & { id: string }> | undefined
}
export const ArtistLinks: React.FC<ArtistLinksProps> = ({ artists, ...props }) => (
	<span {...props}>
		{artists &&
			artists.map((artist, i) => (
				<React.Fragment key={artist.id}>
					<UriLink object={artist} className="opacity-70 hover:opacity-100" href={artist.uri} />
					{i < artists.length - 1 && <span className="opacity-70 pointer-events-none">, </span>}
				</React.Fragment>
			))}
	</span>
)
