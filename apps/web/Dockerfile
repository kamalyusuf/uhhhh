FROM node:alpine AS builder

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=web --docker

FROM node:alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

ENV NEXT_PUBLIC_ENV docker
ENV ENV docker
ENV NEXT_PUBLIC_API_URL http://host.docker.internal:2300

RUN yarn turbo run build --filter=web

FROM node:alpine AS runner
WORKDIR /app

COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .

WORKDIR /app/apps/web
CMD ["yarn", "start"]