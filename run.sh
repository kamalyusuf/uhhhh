#!/usr/bin/env bash

export NODE_ENV=${NODE_ENV:="production"}
export PORT=${PORT:="2300"}
export MEDIASOUP_MIN_PORT=${MEDIASOUP_MIN_PORT:="2000"}
export MEDIASOUP_MAX_PORT=${MEDIASOUP_MAX_PORT:="2020"}
export LISTEN_IP=${LISTEN_IP:="0.0.0.0"}
export WEB_URL=${WEB_URL:="http://localhost:3000"}
export ANNOUNCED_IP=${ANNOUNCED_IP:="127.0.0.1"}

docker run \
        --name uhhhh-api \
        -p "${PORT}":"${PORT}"/tcp \
        -p "${MEDIASOUP_MIN_PORT}"-"${MEDIASOUP_MAX_PORT}":"${MEDIASOUP_MIN_PORT}"-"${MEDIASOUP_MAX_PORT}"/udp \
        -p "${MEDIASOUP_MIN_PORT}"-"${MEDIASOUP_MAX_PORT}":"${MEDIASOUP_MIN_PORT}"-"${MEDIASOUP_MAX_PORT}"/tcp \
        -e NODE_ENV \
        -e PORT \
        -e MEDIASOUP_MIN_PORT \
        -e MEDIASOUP_MAX_PORT \
        -e ANNOUNCED_IP \
        -e LISTEN_IP \
        -e WEB_URL \
        -it \
        --rm \
        kamalyb/uhhhh-api