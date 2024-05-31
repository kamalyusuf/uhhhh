#!/usr/bin/env bash

export PORT=${PORT:="2300"}
export MEDIASOUP_MIN_PORT=${MEDIASOUP_MIN_PORT:="2000"}
export MEDIASOUP_MAX_PORT=${MEDIASOUP_MAX_PORT:="2020"}
export LISTEN_IP=${LISTEN_IP:="0.0.0.0"}
export WEB_URL=${WEB_URL:="http://localhost:3000"}
export MONGO_URL=${MONGO_URL:="mongodb://host.docker.internal:27017/uhhhh"}
export ANNOUNCED_IP=${ANNOUNCED_IP:="127.0.0.1"}

docker run \
        --name uhhhh-api \
        -p ${PORT}:${PORT}/tcp \
        -p ${MEDIASOUP_MIN_PORT}-${MEDIASOUP_MAX_PORT}:${MEDIASOUP_MIN_PORT}-${MEDIASOUP_MAX_PORT}/udp \
        -p ${MEDIASOUP_MIN_PORT}-${MEDIASOUP_MAX_PORT}:${MEDIASOUP_MIN_PORT}-${MEDIASOUP_MAX_PORT}/tcp \
        -e PORT \
        -e MEDIASOUP_MIN_PORT \
        -e MEDIASOUP_MAX_PORT \
        -e MONGO_URL \
        -e ANNOUNCED_IP \
        -e LISTEN_IP \
        -e WEB_URL \
        -it \
        --rm \
        uhhhh-api