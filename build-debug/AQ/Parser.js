var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var Parser = (function (_super) {
        __extends(Parser, _super);
        function Parser(extension, basePath, callback) {
                _super.call(this);
            this._didParseEvents = false;
            this._basePath = basePath;
            this._sounds = new Array();
            this._sequences = new Array();
            this._arrangements = new Array();
            this._soundObjects = new Array();
            this._events = new Array();
            this._callback = callback;
            this._extension = extension;
        }
        Parser.prototype.getNumberOfSounds = function () {
            return this._soundsCount;
        };
        Parser.prototype.haveSoundData = function () {
            return (this._sounds.length > 0);
        };
        Parser.prototype.haveEventData = function () {
            return this._didParseEvents;
        };
        Parser.prototype.parseUrl = function (url) {
            var req = new XMLHttpRequest();
            var self = this;
            req.open("GET", url, true);
            req.onload = function () {
                self.cb_loaded(JSON.parse(req.responseText));
            };
            req.onreadystatechange = function (oEvent) {
            };
            req.send();
        };
        Parser.prototype.parseString = function (jsonData) {
            this.cb_loaded(JSON.parse(jsonData));
        };
        Parser.prototype.cb_loaded = function (json) {
            if(json["root"]) {
                json = json["root"];
            }
            if(json["soundData"]) {
                this._parseSoundData(json);
            }
            if(json["eventData"]) {
                this._parseEventData(json);
            }
            if(json["groupData"]) {
                this._parseGroupData(json);
            }
        };
        Parser.prototype._parseGroupData = function (json) {
            var context = AudioCue.SoundController.getInstance().getMasterContext();
            var groups = this._arrayify(json["groupData"]["group"]);
            for(var i = 0; i < groups.length; i++) {
                var groupName = groups[i]["-name"];
                var volume = parseFloat(groups[i]["volume"]);
                var g = new AudioCue.Group(groupName, context, volume);
                var effects = this._arrayify(groups[i]["effects"]["effect"]);
                for(var j = 0; j < effects.length; j++) {
                    var ename = effects[j]["-id"];
                    var iname = effects[j]["-instance"];
                    var e = g.addEffect(ename, iname);
                    var params = this._arrayify(effects[j]["param"]);
                    for(var k = 0; k < params.length; k++) {
                        e.setParam(params[k]["-key"], parseFloat(params[k]["-value"]));
                    }
                }
            }
            this._callback(1);
        };
        Parser.prototype._parseEventData = function (json) {
            var events = this._arrayify(json["eventData"].action);
            for(var i = 0; i < events.length; i++) {
                var e = events[i];
                var eventName = e["event"];
                var actionsAndArgs = new Array();
                var targets = this._arrayify(e["targets"].target);
                for(var j = 0; j < targets.length; j++) {
                    var target = targets[j];
                    var actionName = target["-id"];
                    if(AudioCue.EventController.getInstance().haveAction(actionName) == false) {
                        console.log("AudioCue: action [" + actionName + "] is not implemented.");
                        continue;
                    }
                    var args = this._arrayify(target["arg"]);
                    var outArgs = new Array();
                    for(var k = 0; k < args.length; k++) {
                        outArgs[args[k]["-key"]] = args[k]["-value"];
                    }
                    var actionAndArg = new AudioCue.ActionAndArg();
                    actionAndArg.actionName = actionName;
                    actionAndArg.args = outArgs;
                    actionsAndArgs.push(actionAndArg);
                }
                this._didParseEvents = true;
                if(actionsAndArgs.length > 0) {
                    var theEvent = new AudioCue.AQEvent();
                    theEvent.name = eventName;
                    theEvent.actionsAndArgs = actionsAndArgs;
                    this._events.push(theEvent);
                } else {
                    console.log("AudioCue: event [" + eventName + "] has no valid actions.");
                }
            }
            this._callback(1);
        };
        Parser.prototype._parseSoundData = function (json) {
            var sounds = json["soundData"].sound;
            this._soundsCount = sounds.length;
            for(var i = 0; i < sounds.length; i++) {
                var sLength = sounds[i].length;
                var sName = sounds[i].name;
                var sType = sounds[i].type;
                var svo = new AudioCue.SoundVO();
                svo.type = parseInt(sType);
                if(isNaN(svo.type)) {
                    svo.type = AudioCue.SoundVO.SOUND_TYPE_AUDIOFILE;
                }
                svo.name = sName;
                svo.path = this._basePath + sName + this._extension;
                if(sLength.search(",") > -1) {
                    var aLength = sLength.split(",");
                    var tempo = parseFloat(aLength[0]);
                    var beats = parseFloat(aLength[1]);
                    svo.musicalLength = (60 / tempo) * beats;
                } else {
                    svo.musicalLength = parseFloat(sLength);
                }
                this._sounds[svo.name] = svo;
            }
            var soundObjects = json["soundData"].soundObject;
            for(var i = 0; i < soundObjects.length; i++) {
                var group = soundObjects[i].group;
                var loop = true;
                if(parseInt(soundObjects[i].loop) == 0) {
                    loop = false;
                }
                var name = soundObjects[i].name;
                var pan = parseFloat(soundObjects[i].pan);
                var parentBus = soundObjects[i].parentBus;
                var volume = parseFloat(soundObjects[i].volume);
                var soundList;
                if(typeof soundObjects[i].sound.length === 'undefined') {
                    soundList = new Array();
                    soundList.push(soundObjects[i].sound);
                } else {
                    soundList = soundObjects[i].sound;
                }
                if(soundObjects[i].mode == SoundObjectStringType.PATTERN) {
                    var sevo = new AudioCue.SequenceVO();
                    sevo.loop = loop;
                    sevo.title = name;
                    sevo.groupName = group;
                    sevo.soundsVO = new Array();
                    for(var j = 0; j < soundList.length; j++) {
                        sevo.soundsVO.push(this._sounds[soundList[j]["#text"]]);
                    }
                    this._sequences[sevo.title] = sevo;
                } else {
                    var sovo = new AudioCue.SoundObjectVO();
                    sovo.title = name;
                    sovo.type = AudioCue.SoundObjectTypes.STEPTRIG;
                    sovo.groupName = group;
                    if(soundObjects[i].mode == SoundObjectStringType.RANDOMTRIG) {
                        sovo.type = AudioCue.SoundObjectTypes.RANDOMTRIG;
                    }
                    sovo.soundsVO = new Array();
                    for(var j = 0; j < soundList.length; j++) {
                        sovo.soundsVO.push(this._sounds[soundList[j]["#text"]]);
                    }
                    this._soundObjects[sovo.title] = sovo;
                }
            }
            var arrangements = json["soundData"].arrangement;
            for(var i = 0; i < arrangements.length; i++) {
                var name = arrangements[i].name;
                var domain = arrangements[i].domain;
                var retrigg = false;
                if(parseInt(arrangements[i].retrigg) == 1) {
                    retrigg = true;
                }
                var seqNames;
                var seqs = new Array();
                if(typeof arrangements[i].soundObject === 'string') {
                    seqNames = new Array();
                    seqNames.push(arrangements[i].soundObject);
                } else {
                    seqNames = arrangements[i].soundObject;
                }
                for(var j = 0; j < seqNames.length; j++) {
                    if(seqNames[j]["-upbeat"]) {
                        console.log("AudioCue: sequence [" + name + "] has upbeat, skipping");
                    } else {
                        seqs.push(this._sequences[seqNames[j]]);
                    }
                }
                var avo = new AudioCue.ArrangementVO();
                avo.sequencesVO = seqs;
                avo.title = name;
                avo.domain = domain;
                this._arrangements[avo.title] = avo;
            }
            this._callback(1);
        };
        Parser.prototype._arrayify = function (obj) {
            var newObj;
            if(obj.length == undefined) {
                newObj = new Array();
                newObj.push(obj);
                return newObj;
            } else {
                return obj;
            }
        };
        Parser.prototype.getSoundsVO = function () {
            return this._sounds;
        };
        Parser.prototype.getSequencesVO = function () {
            return this._sequences;
        };
        Parser.prototype.getArrangementsVO = function () {
            return this._arrangements;
        };
        Parser.prototype.getSoundObjectsVO = function () {
            return this._soundObjects;
        };
        Parser.prototype.getEvents = function () {
            return this._events;
        };
        return Parser;
    })(AudioCue.AQObject);
    AudioCue.Parser = Parser;    
    var SoundObjectStringType = (function () {
        function SoundObjectStringType() { }
        SoundObjectStringType.PATTERN = "pattern";
        SoundObjectStringType.STEPTRIG = "steptrig";
        SoundObjectStringType.RANDOMTRIG = "randomtrig";
        return SoundObjectStringType;
    })();    
})(AudioCue || (AudioCue = {}));
