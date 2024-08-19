FROM node:20-slim AS builder

WORKDIR /app
RUN corepack enable
COPY . .
RUN yarn global add turbo
RUN turbo prune --scope=api --docker

FROM node:20-slim AS installer
WORKDIR /app

ENV MEDIASOUP_SKIP_WORKER_PREBUILT_DOWNLOAD="true"

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        python3 \
        python3-pip

RUN corepack enable

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN yarn turbo run build --filter=api

FROM node:20-slim AS runner
WORKDIR /app

# RUN corepack enable

COPY --from=installer /app/apps/api/package.json .
COPY --from=installer /app/apps/api/dist ./dist
COPY --from=installer /app/node_modules ./node_modules

CMD ["node", "--import", "./dist/instrument.js", "./dist/index.js"]