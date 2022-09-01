#!/usr/bin/env bash

function parse() {
    echo 'start to parse'
    node src/process.js parse
}

function build() {
    echo 'start to build'
    node src/process.js build
}

function publish() {
    echo 'start to publish'
    echo "npm user: $(npm whoami)"
    sed -i 's/"version": "1.0.0"/"version": "1.0.0-'"${COMMIT_ID:0:6}"'"/' package.json
    npm publish
}

function main() {
    echo "startTime: $(date '+%F %T')"
    eval "$1"
    echo 'run success'
    echo "endTime: $(date '+%F %T')"
}

main "$1"
