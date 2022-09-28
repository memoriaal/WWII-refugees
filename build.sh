#!/bin/bash

set -o errexit -o nounset
echo "set -o errexit -o nounset"
rm -rf ./build
echo "rm -rf ./build"
mkdir -p ./build/assets
echo "mkdir -p ./build/assets"

cp -r ./assets/* ./build/assets
echo "cp -r ./assets/* ./build/assets"

npm run build
echo "npm run build"
