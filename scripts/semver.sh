#!/bin/bash

# Get version number
yarn release --dry-run --no-ci -p > release.log
cat release.log

grep -oP 'next release version is \K[0-9]+\.[0-9]+\.[0-9]+' release.log > .version
VERSION=$(cat .version)

if [ -s .version ]; then
	echo "Next version: $VERSION"
	echo "VERSION=$VERSION" >> "$GITHUB_OUTPUT"
else
	echo "No new version. Canceling deploy."
fi
