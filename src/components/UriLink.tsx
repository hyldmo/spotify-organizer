import React from 'react'
import { Link } from 'react-router-dom'
import { Nullable, UriObject } from 'types'
import { isUriType, SongCache, uriToId } from 'utils'

interface Props extends React.HTMLProps<HTMLAnchorElement> {
	object: Nullable<UriObject>
}

export const SimpleUriLink: React.FC<Props> = ({ object, children, ...props }) => {
	const childNode = children || object?.name || object?.display_name || object?.uri
	return (
		<a href={object?.uri} {...props}>
			{childNode}
		</a>
	)
}

export const UriLink: React.FC<Props> = props => {
	const { object, children, ...rest } = props
	const childNode = children || object?.name || object?.display_name || object?.uri
	if (isUriType(object, 'playlist')) {
		return (
			<Link to={`/playlists/${uriToId(object.uri)}`} {...(rest as any)}>
				{childNode}
			</Link>
		)
	}
	if (isUriType(object, 'track')) {
		const track = SongCache.get(uriToId(object.uri)) || object
		return (
			<Link to={`/tracks/${uriToId(object.uri)}`} {...(rest as any)}>
				{children || track?.name || track?.uri}
			</Link>
		)
	}

	return <SimpleUriLink {...props} />
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
