#!/bin/bash

tsc "$1"
/bin/rm -r -f "$2/build-debug"
/bin/mkdir "$2/build-debug"
/bin/mkdir "$2/build-debug/AQ"

/bin/mv "$2/src/"*.js "$2/build-debug/"
/bin/mv "$2/src/AQ/"*.js "$2/build-debug/AQ"
/bin/cp -r "$2/src/thirdparty" "$2/build-debug/thirdparty"
/bin/cp -r "$2/assets" "$2/build-debug"
/bin/cp "$2/src/wwwentry/index-debug.html" "$2/build-debug/index.html"