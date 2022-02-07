#!/bin/bash
set -e
# Get version number
yarn release --dry-run --no-ci | grep -oP 'next release version is \K[0-9]+\.[0-9]+\.[0-9]+' > .version

VERSION=$(cat .version)

if [ -s .version ]; then
	echo "Next version: $VERSION"
else
	echo "No new version. Canceling deploy."
fi
cat .version | awk '{print "PACKAGE_VERSION="$1}' >> .env

echo "::set-output name=VERSION::$VERSION"
