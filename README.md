# Spotify Organiser

![GitHub release (latest by date)](https://img.shields.io/github/v/release/hyldmo/spotify-organizer)
[![Deploy to Production](https://github.com/hyldmo/spotify-organizer/actions/workflows/deploy.yml/badge.svg)](https://github.com/hyldmo/spotify-organizer/actions/workflows/deploy.yml)
[![Coverage Status](https://coveralls.io/repos/github/hyldmo/spotify-organizer/badge.svg?branch=master)](https://coveralls.io/github/hyldmo/spotify-organizer?branch=master)
[![CodeQL Analysis](https://github.com/hyldmo/spotify-organizer/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/hyldmo/spotify-organizer/actions/workflows/codeql-analysis.yml)
![GitHub License](https://img.shields.io/github/license/hyldmo/spotify-organizer)

Clean up and organize your Spotify playlists

Live version at https://spotify-organiser.pages.dev/

## Connect an AI assistant

Spotify Organiser has an [MCP](https://modelcontextprotocol.io) server. Claude, ChatGPT, Cursor and other MCP clients can use it to read and organise your playlists, manage your library and control playback.

Add `https://spotify-organiser.pages.dev/mcp` as a custom connector or remote MCP server, or open **Connect an AI assistant** in the app's settings menu. Your client opens a browser window: allow access, then sign in with Spotify. See [`workers/README.md`](workers/README.md) for how it works.
