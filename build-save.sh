#!/bin/sh

OUTPUT_FILENAME=$1

if [ $# -eq 0 ]; then
    echo "Error: No arguments supplied"
    exit 1
fi

docker build -t octopus-ui .

if [ $? -ne 0 ]; then
    echo "Error building docker image"
    exit $?
fi

docker save -o $OUTPUT_FILENAME octopus-ui

if [ $? -ne 0 ]; then
    echo "Error saving docker tar"
    exit $?
fi

exit $?