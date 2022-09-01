#!/usr/bin/env bash

function parse() {
    node src/process.js parse
}

function build() {
    node src/process.js build
}

function main() {
    eval "$1"
}

main "$1"
