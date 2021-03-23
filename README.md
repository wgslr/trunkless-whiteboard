<div align="center">
  <h1><code>Trunkless Whiteboard</code></h1>
</div>

## Description

This project is a proof-of-concept implementation of a whiteboarding protocol created as an assignment for the ELEC-E7320 Internet Protocols course at Aalto University.

Live demo: [trunkless-whiteboard.website](https://trunkless-whiteboard.website)

The repository is a Lerna monorepo consisting of the following packages:
- `backend` - centralized server code
- `client` - user client for interacting with the server from a whiteboard
- `encoding` - shared library between `client` and `server`
- `benchmarks` - benchmarking scripts and analysis of the protocol/system

## Setup

### Docker

Alternatively to the manual steps below, you may opt for using our Docker image:

  docker run \
    --name="trunkless-whiteboard" \
    --publish 3001:3001 \
    --detach \
    docker.pkg.github.com/wgslr/trunkless-whiteboard/app-image

The app should now be accessible at `localhost:3001`.

### Prerequisites

Ensure that you have the following follow installed on you machine:
- `yarn` version `>=1.22.0`
- `node` version `>=15.10.0`
- `protoc` version `>=3.13.0`
  - [https://developers.google.com/protocol-buffers/docs/downloads](https://developers.google.com/protocol-buffers/docs/downloads)

### Installation

First install all Node modules in the root folder:

  yarn

Generate the protobuf type definitions:

  yarn protoc

Link packages together:

  yarn bootstrap

### Running Development Build

To run a development setup, the easiest way is to run the following in the root folder:

  yarn start:dev

This will start the server and a client for you.
The client is expose at `localhost:3000` by default.

You may also run each package separately by entering the package folders and running the same commands.

### Running Production Build

First build a production build (run from root folder):

  yarn build:prod

The execute the production build with:

  yarn exec:prod

The app should now be exposed at `localhost:3001`.

--------------------------------------------------------------------------------

_If you want to setup a server configuration on your own, see_ `server_configuration`.
