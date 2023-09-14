#!/bin/bash

rm -rf ./dist
mkdir ./dist

cp index.html ./dist
cp script.js ./dist
cp style.css ./dist
cp assets ./dist -r
