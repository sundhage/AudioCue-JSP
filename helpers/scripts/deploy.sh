#!/bin/bash

#will produce a .js of AQ and a _min.js of AQ.
#args: arg1 -> path to AQ directory, arg2 -> output filename
cat $1/PoolController.js $1/AQObject.js $1/AQStructs.js $1/Parser.js $1/EventController.js $1/BasicActions.js $1/AudioLoader.js $1/SoundController.js $1/Group.js $1/ArrangementController.js $1/Arrangement.js $1/Sequence.js $1/SoundObject.js $1/Sound.js $1/Silence.js $1/AQController.js > $2.js

BASEDIR=$(dirname $0)
$BASEDIR/../../bin/jsmin < $2.js > $2_min.js