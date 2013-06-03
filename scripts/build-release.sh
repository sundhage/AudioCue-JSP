#!/bin/bash

tsc "$1"
/bin/rm -r -f "$2/build-release"
/bin/mkdir "$2/build-release"
/bin/mkdir "$2/build-release/AQ"

/bin/mv "$2/src/"*.js "$2/build-release/"
/bin/mv "$2/src/AQ/"*.js "$2/build-release/AQ"
/bin/cp -r "$2/src/thirdparty" "$2/build-release/thirdparty"
/bin/cp -r "$2/assets" "$2/build-release"
/bin/cp "$2/src/wwwentry/index-release.html" "$2/build-release/index.html"

/bin/cat "$2/build-release/AQ/"PoolController.js "$2/build-release/AQ/"AQObject.js "$2/build-release/AQ/"AQStructs.js "$2/build-release/AQ/"Parser.js "$2/build-release/AQ/"EventController.js "$2/build-release/AQ/"BasicActions.js "$2/build-release/AQ/"AudioLoader.js "$2/build-release/AQ/"SoundController.js "$2/build-release/AQ/"Group.js "$2/build-release/AQ/"ArrangementController.js "$2/build-release/AQ/"Arrangement.js "$2/build-release/AQ/"Sequence.js "$2/build-release/AQ/"SoundObject.js "$2/build-release/AQ/"Sound.js "$2/build-release/AQ/"Silence.js "$2/build-release/AQ/"AQController.js > "$2/build-release/"aq.js
/bin/rm -r -f "$2/build-release/AQ"
"$2"/bin/jsmin < "$2"/build-release/aq.js > "$2"/build-release/aq_min.js
/bin/rm "$2"/build-release/aq.js

