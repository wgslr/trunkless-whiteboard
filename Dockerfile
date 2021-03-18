# Build
FROM node:15.11.0-slim as builder

WORKDIR /app

# https://grpc.io/docs/protoc-installation/
RUN apt-get update \
  && apt-get --assume-yes install curl unzip \
  && curl --location --remote-name https://github.com/protocolbuffers/protobuf/releases/download/v3.15.5/protoc-3.15.5-linux-x86_64.zip \
  && unzip protoc-3.15.5-linux-x86_64.zip -d /usr/local/

COPY . ./
RUN yarn install --frozen-lockfile --non-interactive --silent
RUN yarn run protoc
RUN yarn run build:prod

# Execute
FROM node:15.11.0-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json lerna.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/client/package.json ./packages/client/
COPY packages/encoding/package.json ./packages/encoding/

COPY --from=builder /app/packages/encoding/dist ./packages/encoding/dist

RUN yarn global add lerna && lerna bootstrap --ignore-scripts -- --production --no-optional
COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "./dist/index.js"]
