#!/bin/sh

INPUT_FILENAME=$1

if [ $# -eq 0 ]; then
    echo "Error: No arguments supplied"
    exit 1
fi

docker-compose stop

if [ $? -ne 0 ]; then
    echo "Error stopping docker-compose"
    exit $?
fi

docker load -i $1

if [ $? -ne 0 ]; then
    echo "Error loading new docker image"
    exit $?
fi

docker-compose up --build -d

if [ $? -ne 0 ]; then
    echo "Error starting docker-compose"
    exit $?
fi

exit $?