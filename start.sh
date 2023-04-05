#!/bin/bash

npm install phantomjs-prebuilt@2.1.16 --ignore-scripts
npm install
cd src/
bower install
cd ../
npm install grunt
sudo gem install compass
npm install --save-dev coffeescript
npm install grunt --save-dev
cd src/
npm install --save-dev time-grunt
grunt build-local --target=local
cd dist/
node server.js