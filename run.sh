#!/usr/bin/env bash

export PORT=${PORT:="5000"}
export MEDIASOUP_MIN_PORT=${MEDIASOUP_MIN_PORT:="2000"}
export MEDIASOUP_MAX_PORT=${MEDIASOUP_MAX_PORT:="2020"}
export LISTEN_IP=${LISTEN_IP:="0.0.0.0"}
export WEB_URL=${WEB_URL:="http://localhost:3000"}

docker run \
        --name uhhhh-api \
        -p ${PORT}:${PORT}/tcp \
        -p ${MEDIASOUP_MIN_PORT}-${MEDIASOUP_MAX_PORT}:${MEDIASOUP_MIN_PORT}-${MEDIASOUP_MAX_PORT}/udp \
        -p ${MEDIASOUP_MIN_PORT}-${MEDIASOUP_MAX_PORT}:${MEDIASOUP_MIN_PORT}-${MEDIASOUP_MAX_PORT}/tcp \
        -e PORT \
        -e MEDIASOUP_MIN_PORT \
        -e MEDIASOUP_MAX_PORT \
        -e LISTEN_IP \
        -e WEB_URL \
        --env-file ./.env \
        -it \
        --rm \
        kamalyb/uhhhh-api


# -- .env --
# MONGO_URL=
# NODE_ENV=
# ANNOUNCED_IP=
# SENTRY_DSN=