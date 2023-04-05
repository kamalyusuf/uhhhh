FROM node:alpine AS builder

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=api --docker

FROM ubuntu:20.04 AS installer
WORKDIR /app

RUN \
    apt-get update && \
    apt-get install -y build-essential

RUN \
    DEBIAN_FRONTEND=noninteractive apt-get install -y tzdata && \
    apt install -y software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt update && \
    apt install -y python3.8 python3-pip

RUN \
    apt install -y curl dirmngr apt-transport-https lsb-release ca-certificates && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

RUN npm install -g yarn

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN yarn turbo run build --filter=api

WORKDIR /app/apps/api

CMD ["node", "dist/index.js"]