#!/bin/bash

cd src/
npm install phantomjs-prebuilt@2.1.16 --ignore-scripts
npm install
bower install
cd ../
npm install grunt --save-dev
sudo gem install compass
cd src/
npm install --save-dev coffeescript
grunt build-local --target=local
cd dist/
node server.js
