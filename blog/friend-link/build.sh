#!/usr/bin/env bash

function install() {
    npm install minimist --save-dev
}

function parse() {
    node src/process.js parse
}

function build() {
    node src/process.js build
}

function main() {
    install
    eval "$1"
}

main "$1"
