#!/bin/bash

set -o errexit -o nounset

rm -rf ./dist
mkdir ./dist

cp -r ./public/* ./dist
npm install
npm run build
