#!/bin/bash

set -o errexit -o nounset

rm -rf ./dist
mkdir ./dist

cp index.html ./dist
cp script.js ./dist
cp style.css ./dist

