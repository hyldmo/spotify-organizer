#!/bin/bash

# Get version number
yarn release --dry-run --no-ci -p > release.log
cat release.log
grep -oP 'next release version is \K[0-9]+\.[0-9]+\.[0-9]+' release.log > .version

VERSION=$(cat .version)

if [ -s .version ]; then
	echo "Next version: $VERSION"
	cat .version | awk '{print "PACKAGE_VERSION="$1}' >> .env
	echo "::set-output name=VERSION::$VERSION"
else
	echo "No new version. Canceling deploy."
fi
