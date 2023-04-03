#Readme

###Working locally
- npm install phantomjs-prebuilt@2.1.16 --ignore-scripts
- npm install
- bower install (in caso di errori su ng-file-saver: https://github.com/alferov/angular-file-saver/issues/48#issuecomment-1106935181)
- npm install grunt
- sudo gem install compass
- npm install --save-dev coffeescript
- grunt build-local --target=local
- cd dist
- node server.js

If you're in dist folder, just type

    cd .. && grunt build-local --target=local && cd dist && node server.js

whenever you edit source code and want it reflected in dist folder

####Make local package
- grunt clean build-local --target=local --verbose

###Prerequisites for dockerization
* git
* Docker version>=17.12.1~ce-0~ubuntu
* Logged in dockerhub.planetek.it to push the images

###Examples: prepare the docker image

######Read the help
    ./build.sh -h to read the help

######Build branch "develop" and tag the docker image as "dev"
    ./build.sh dev -b develop -p development

######Build local branch using as docker base image the one tagged as "develop" and tag the built image as "develop"
    ./build.sh develop -b develop -l -p development

######Build local branch using as docker base image the one tagged as "master" and tag the built image as "v1.0.0"
    ./build.sh v1.0.0 -b master -l -p production

######Build branch using as docker base image the one tagged as "master" and tag the built image as "v1.0.0" and push 
    ./build.sh v1.0.0 -b master -p production
