# Build
FROM node:15.11.0-slim as builder
WORKDIR /app
COPY . ./
RUN yarn install --frozen-lockfile --non-interactive --silent
RUN yarn run build:prod

# Execute
FROM node:15.11.0-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json lerna.json yarn.lock ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/client/package.json ./packages/client/
COPY packages/encoding/package.json ./packages/encoding/

COPY --from=builder packages/encoding/dist ./packages/encoding/dist

RUN yarn global add lerna && lerna bootstrap --ignore-scripts -- --production --no-optional
COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "./dist/index.js"]
