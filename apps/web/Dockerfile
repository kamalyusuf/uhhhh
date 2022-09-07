FROM node:alpine AS builder
RUN apk update

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=web --docker

FROM node:alpine AS installer
RUN apk update
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

FROM node:alpine AS sourcer
RUN apk update
WORKDIR /app

#ENV NEXT_PUBLIC_API_URL http://host.docker.internal:5000
ENV NEXT_PUBLIC_API_URL http://localhost:5000
ENV ENV docker

COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .
COPY .gitignore .gitignore
RUN yarn turbo run build --scope=web --include-dependencies --no-deps

WORKDIR /app/apps/web
CMD ["yarn", "start"]