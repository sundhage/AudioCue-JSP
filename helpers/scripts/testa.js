var AudioCue;
(function (AudioCue) {
    var PoolController = (function () {
        function PoolController() { }
        PoolController.pools = new Array();
        PoolController.createPool = function createPool(t, args, count) {
            if(!PoolController.pools[t]) {
                var pool = new Pool();
                pool.busyObjects = new Array();
                pool.cls = t;
                PoolController.pools[t] = pool;
                var llc;
                var llprev;
                var llnext;
                for(var i = 0; i < count; i++) {
                    var obj = new t();
                    obj._poolid = i;
                    llc = new LinkedList();
                    llc.object = obj;
                    llc.next = null;
                    llc.prev = llprev;
                    if(llprev) {
                        llprev.next = llc;
                    }
                    llprev = llc;
                    if(i == 0) {
                        pool.firstFree = llc;
                    }
                }
                return true;
            }
            return false;
        };
        PoolController.getObject = function getObject(t) {
            var pool = PoolController.pools[t];
            if(!pool) {
                return null;
            }
            var f = pool.firstFree;
            if(!f) {
                return null;
            }
            pool.firstFree = f.next;
            f.prev = null;
            if(!pool.firstBusy) {
                f.next = null;
            } else {
                pool.firstBusy.prev = f;
                f.next = pool.firstBusy;
            }
            pool.firstBusy = f;
            pool.busyObjects[f.object._poolid] = f;
            return f.object;
        };
        PoolController.freeObject = function freeObject(t, instance) {
            var ll = PoolController.pools[t].busyObjects[instance._poolid];
            if(!ll) {
                return false;
            }
            PoolController.pools[t].busyObjects[instance._poolid] = null;
            if(ll.prev) {
                ll.prev.next = ll.next;
            }
            if(ll.next) {
                ll.next.prev = ll.prev;
            }
            if(PoolController.pools[t].firstBusy == ll) {
                PoolController.pools[t].firstBusy = ll.next;
            }
            ll.prev = null;
            if(PoolController.pools[t].firstFree) {
                ll.next = PoolController.pools[t].firstFree;
                ll.next.prev = ll;
            } else {
                ll.next = null;
            }
            PoolController.pools[t].firstFree = ll;
            return true;
        };
        return PoolController;
    })();
    AudioCue.PoolController = PoolController;    
    var Pool = (function () {
        function Pool() { }
        return Pool;
    })();
    AudioCue.Pool = Pool;    
    var LinkedList = (function () {
        function LinkedList() { }
        return LinkedList;
    })();
    AudioCue.LinkedList = LinkedList;    
    var Poolable = (function () {
        function Poolable() { }
        return Poolable;
    })();
    AudioCue.Poolable = Poolable;    
})(AudioCue || (AudioCue = {}));
var AudioCue;
(function (AudioCue) {
    var AQObject = (function () {
        function AQObject() {
            var _this = this, _constructor = (this).constructor;
            if(!_constructor.__cb__) {
                _constructor.__cb__ = {
                };
                for(var m in this) {
                    var fn = this[m];
                    if(typeof fn === 'function' && m.indexOf('cb_') == 0) {
                        _constructor.__cb__[m] = fn;
                    }
                }
            }
            for(var m in _constructor.__cb__) {
                (function (m, fn) {
                    _this[m] = function () {
                        return fn.apply(_this, Array.prototype.slice.call(arguments));
                    };
                })(m, _constructor.__cb__[m]);
            }
        }
        return AQObject;
    })();
    AudioCue.AQObject = AQObject;    
})(AudioCue || (AudioCue = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var PlayingSound = (function (_super) {
        __extends(PlayingSound, _super);
        function PlayingSound() {
            _super.apply(this, arguments);

        }
        PlayingSound.prototype.startListening = function (callback) {
            AudioCue.SoundController.getInstance().addPlayingSound(this, callback);
        };
        return PlayingSound;
    })(AudioCue.Poolable);
    AudioCue.PlayingSound = PlayingSound;    
    var AudioSource = (function () {
        function AudioSource() { }
        return AudioSource;
    })();
    AudioCue.AudioSource = AudioSource;    
    var SoundVO = (function () {
        function SoundVO() { }
        SoundVO.SOUND_TYPE_AUDIOFILE = 0;
        SoundVO.SOUND_TYPE_SILENCE = 1;
        return SoundVO;
    })();
    AudioCue.SoundVO = SoundVO;    
    var SoundObjectVO = (function () {
        function SoundObjectVO() { }
        return SoundObjectVO;
    })();
    AudioCue.SoundObjectVO = SoundObjectVO;    
    var SequenceVO = (function () {
        function SequenceVO() { }
        return SequenceVO;
    })();
    AudioCue.SequenceVO = SequenceVO;    
    var ArrangementVO = (function () {
        function ArrangementVO() { }
        return ArrangementVO;
    })();
    AudioCue.ArrangementVO = ArrangementVO;    
    var SoundEvents = (function () {
        function SoundEvents() { }
        SoundEvents.SOUND_END = "soundend";
        SoundEvents.SOUND_MUSICAL_END = "soundmusicalend";
        SoundEvents.SOUND_START = "soundstart";
        return SoundEvents;
    })();
    AudioCue.SoundEvents = SoundEvents;    
})(AudioCue || (AudioCue = {}));
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
                    console.log("Skipping event: " + eventName);
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
                        console.log("PARSER: has upbeat, skipping");
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
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var EventController = (function (_super) {
        __extends(EventController, _super);
        function EventController() {
                _super.call(this);
            this._actions = new Array();
            this._events = new Array();
        }
        EventController._instance = null;
        EventController.createInstance = function createInstance() {
            if(!EventController._instance) {
                EventController._instance = new EventController();
            }
            return EventController._instance;
        };
        EventController.getInstance = function getInstance() {
            return EventController._instance;
        };
        EventController.prototype.addEvent = function (event) {
            this._events[event.name] = event;
        };
        EventController.prototype.addAction = function (action, name) {
            this._actions[name] = action;
        };
        EventController.prototype.haveAction = function (actionName) {
            return (this._actions[actionName] != undefined);
        };
        EventController.prototype.getEvents = function () {
            return this._events;
        };
        EventController.prototype.dispatchEvent = function (eventName, devArgs) {
            if (typeof devArgs === "undefined") { devArgs = null; }
            var event = this._events[eventName];
            var ret = 0;
            for(var i = 0; i < event.actionsAndArgs.length; i++) {
                var val = this._actions[event.actionsAndArgs[i].actionName](event.actionsAndArgs[i].args, devArgs);
                if(val > ret) {
                    ret = val;
                }
            }
            return ret;
        };
        return EventController;
    })(AudioCue.AQObject);
    AudioCue.EventController = EventController;    
    var ActionAndArg = (function () {
        function ActionAndArg() { }
        return ActionAndArg;
    })();
    AudioCue.ActionAndArg = ActionAndArg;    
    var AQEvent = (function () {
        function AQEvent() { }
        return AQEvent;
    })();
    AudioCue.AQEvent = AQEvent;    
    EventController.createInstance();
})(AudioCue || (AudioCue = {}));
var AudioCue;
(function (AudioCue) {
    var PlayArrAction = function (args, devArgs) {
        var ac = AudioCue.ArrangementController.getInstance();
        var name = args["name"];
        var cue = null;
        if(args["cue"]) {
            cue = args["cue"];
        }
        var retCueStart = (args["retCueStart"] == "1");
        return ac.playArrangement(name, cue, retCueStart);
    };
    AudioCue.EventController.getInstance().addAction(PlayArrAction, "PlayArrAction");
    var StopDomainAction = function (args, devArgs) {
        var ac = AudioCue.ArrangementController.getInstance();
        var name = args["name"];
        var hard = (args["hard"] == "1");
        return ac.stopDomain(name, hard);
    };
    AudioCue.EventController.getInstance().addAction(StopDomainAction, "StopDomainAction");
    var StartSOAction = function (args, devArgs) {
        var so = AudioCue.SoundObject.getSoundObject(args["name"]);
        so.play();
        return 0;
    };
    AudioCue.EventController.getInstance().addAction(StartSOAction, "StartSOAction");
    var StopSOAction = function (args, devArgs) {
        var so = AudioCue.SoundObject.getSoundObject(args["name"]);
        so.stop();
        return 0;
    };
    AudioCue.EventController.getInstance().addAction(StopSOAction, "StopSOAction");
    var EffectParamAction = function (args, devArgs) {
        var e = AudioCue.Effect.getEffect(args["name"]);
        return e.setParam(args["param"], parseFloat(args["value"]), parseFloat(args["time"]));
    };
    AudioCue.EventController.getInstance().addAction(EffectParamAction, "EffectParamAction");
})(AudioCue || (AudioCue = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var AudioLoader = (function (_super) {
        __extends(AudioLoader, _super);
        function AudioLoader(callback) {
                _super.call(this);
            this._callback = callback;
            this._loadCue = new Array();
            this._loadedData = new Array();
            this._loadedDataMap = new Array();
            this._isPreloading = false;
            this._context = new webkitAudioContext();
        }
        AudioLoader.prototype.addFile = function (soundVO) {
            if(this._isPreloading) {
                return;
            }
            var af = new AudioCue.AudioSource();
            af.soundVO = soundVO;
            this._loadCue.push(af);
        };
        AudioLoader.prototype.addFiles = function (soundsVO) {
            if(this._isPreloading == true) {
                return;
            }
            for(var prop in soundsVO) {
                this.addFile(soundsVO[prop]);
            }
        };
        AudioLoader.prototype.preloadAll = function (jsonAudioData) {
            if (typeof jsonAudioData === "undefined") { jsonAudioData = null; }
            if(this._loadCue.length == 0) {
                return false;
            }
            this._isPreloading = true;
            if(jsonAudioData) {
                this._audioFileJSON = jsonAudioData;
                this._preloadFromBase64();
            } else {
                this._preload();
            }
            return true;
        };
        AudioLoader.prototype._preloadFromBase64 = function () {
            var af = this._loadCue[0];
            var self = this;
            this._loadedData.push(af);
            this._loadCue.shift();
            if(af.soundVO.type != AudioCue.SoundVO.SOUND_TYPE_AUDIOFILE) {
                this.cb_dataDecoded(null);
                return;
            }
            var mp3 = Base64Binary.decodeArrayBuffer(this._audioFileJSON["files"][af.soundVO.path]);
            this._context.decodeAudioData(mp3, this.cb_dataDecoded, this.cb_onDecodeError);
        };
        AudioLoader.prototype.cb_dataDecoded = function (buffer) {
            var af;
            af = this._loadedData[this._loadedData.length - 1];
            af.buffer = buffer;
            af.isValid = true;
            this._loadedDataMap[af.soundVO.name] = af;
            this._callback(af, this._loadCue.length);
            if(this._loadCue.length > 0) {
                this._preloadFromBase64();
            }
        };
        AudioLoader.prototype._preload = function () {
            var af = this._loadCue[0];
            var self = this;
            this._loadedData.push(af);
            this._loadCue.shift();
            if(af.soundVO.type != AudioCue.SoundVO.SOUND_TYPE_AUDIOFILE) {
                this.cb_dataLoadedAndDecoded(null);
                return;
            }
            var req = new XMLHttpRequest();
            req.open("GET", af.soundVO.path, true);
            req.responseType = "arraybuffer";
            req.onload = function () {
                self._context.decodeAudioData(req.response, self.cb_dataLoadedAndDecoded, self.cb_onDecodeError);
            };
            req.onreadystatechange = function (oEvent) {
            };
            req.send();
        };
        AudioLoader.prototype.cb_onDecodeError = function () {
            console.log("File could not be decoded...");
        };
        AudioLoader.prototype.cb_dataLoadedAndDecoded = function (buffer) {
            var af;
            af = this._loadedData[this._loadedData.length - 1];
            af.buffer = buffer;
            af.isValid = true;
            this._loadedDataMap[af.soundVO.name] = af;
            this._callback(af, this._loadCue.length);
            if(this._loadCue.length > 0) {
                this._preload();
            }
        };
        AudioLoader.prototype.getAudioSourcesMap = function () {
            return this._loadedDataMap;
        };
        return AudioLoader;
    })(AudioCue.AQObject);
    AudioCue.AudioLoader = AudioLoader;    
})(AudioCue || (AudioCue = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var SoundController = (function (_super) {
        __extends(SoundController, _super);
        function SoundController(callback) {
                _super.call(this);
            this._toBeRemoved = [];
            this._callback = callback;
            this._context = new webkitAudioContext();
            this._playingSounds = new Array();
        }
        SoundController.LOOKAHEAD = (1024 / 44100) * 2;
        SoundController.createSound = function createSound(audioSource, ctx, callback) {
            var snd = null;
            var vo = audioSource.soundVO;
            if(vo.type == AudioCue.SoundVO.SOUND_TYPE_AUDIOFILE) {
                snd = new AudioCue.Sound(audioSource, ctx, callback);
            } else if(vo.type == AudioCue.SoundVO.SOUND_TYPE_SILENCE) {
                snd = new AudioCue.Silence(audioSource, ctx, callback);
            }
            return snd;
        };
        SoundController._instance = null;
        SoundController.createInstance = function createInstance(callback) {
            if(!SoundController._instance) {
                SoundController._instance = new SoundController(callback);
            }
            return SoundController._instance;
        };
        SoundController.getInstance = function getInstance() {
            return SoundController._instance;
        };
        SoundController.prototype.getMasterContext = function () {
            return this._context;
        };
        SoundController.prototype.cb_processAudio = function (e) {
            this._toBeRemoved.length = 0;
            for(var i = 0; i < this._playingSounds.length; i++) {
                var p = this._playingSounds[i];
                var sound = p.playingSound.parent;
                var ctx = sound.getContext();
                var endPos = p.playingSound.startTime + p.playingSound.parent.getDuration();
                var mxEndPos = p.playingSound.startTime + p.playingSound.parent.getMusicalLength() - SoundController.LOOKAHEAD;
                var currentPos = ctx.currentTime;
                if(currentPos >= endPos) {
                    this._toBeRemoved.push(p.playingSound);
                }
                if(currentPos >= mxEndPos && p.musicalEndIsDispatched == false) {
                    p.musicalEndIsDispatched = true;
                    p.callback(AudioCue.SoundEvents.SOUND_MUSICAL_END, p.playingSound, 0);
                }
                if(currentPos >= p.playingSound.startTime && p.startIsDispatched == false) {
                    p.startIsDispatched = true;
                    p.callback(AudioCue.SoundEvents.SOUND_START, p.playingSound, 0);
                }
            }
            if(this._toBeRemoved.length > 0) {
                this._removePlayingSounds(this._toBeRemoved, true);
            }
        };
        SoundController.prototype.start = function () {
            try  {
                this._scriptNode = this._context.createScriptProcessor(1024, 1, 1);
            } catch (e) {
                this._scriptNode = this._context.createJavaScriptNode(1024, 1, 1);
            }
            this._scriptNode.onaudioprocess = this.cb_processAudio;
            this._scriptNode.connect(this._context.destination);
        };
        SoundController.prototype.stop = function () {
            this._scriptNode.disconnect();
        };
        SoundController.prototype.getOutputContext = function () {
            return this._context;
        };
        SoundController.prototype.addPlayingSound = function (p, callback) {
            var ph = new PlayingSoundHolder();
            ph.playingSound = p;
            ph.callback = callback;
            ph.musicalEndIsDispatched = false;
            ph.startIsDispatched = false;
            this._playingSounds.push(ph);
        };
        SoundController.prototype.removePlayingSound = function (p) {
            this._toBeRemoved.length = 0;
            this._toBeRemoved.push(p);
            this._removePlayingSounds(this._toBeRemoved, false);
        };
        SoundController.prototype._removePlayingSounds = function (p, dispatch) {
            for(var j = 0; j < p.length; j++) {
                for(var i = 0; i < this._playingSounds.length; i++) {
                    if(p[j] == this._playingSounds[i].playingSound) {
                        if(dispatch) {
                            this._playingSounds[i].callback(AudioCue.SoundEvents.SOUND_END, this._playingSounds[i].playingSound, 0);
                        }
                        AudioCue.PoolController.freeObject(AudioCue.PlayingSound, this._playingSounds[i].playingSound);
                        this._playingSounds.splice(i, 1);
                        break;
                    }
                }
            }
        };
        return SoundController;
    })(AudioCue.AQObject);
    AudioCue.SoundController = SoundController;    
    var PlayingSoundHolder = (function () {
        function PlayingSoundHolder() { }
        return PlayingSoundHolder;
    })();
    AudioCue.PlayingSoundHolder = PlayingSoundHolder;    
})(AudioCue || (AudioCue = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group(name, context, gain) {
            if (typeof gain === "undefined") { gain = 1; }
                _super.call(this);
            this._effects = new Array();
            Group.allGroups[name] = this;
            this._context = context;
            this._gain = this._context.createGain();
            this._gain.gain.value = gain;
            this._lastNode = this._gain;
            this._gain.connect(this._context.destination);
        }
        Group.allGroups = new Array();
        Group.getGroup = function getGroup(name) {
            return Group.allGroups[name];
        };
        Group.prototype.getNode = function () {
            return this._gain;
        };
        Group.prototype.addEffect = function (effectType, instanceName) {
            var ef = new Effect(effectType, instanceName, this._context);
            ef.getNode().connect(this._context.destination);
            this._lastNode.disconnect();
            this._lastNode.connect(ef.getNode());
            this._lastNode = ef.getNode();
            this._effects.push(ef);
            return ef;
        };
        Group.prototype.setGain = function (value, time) {
            if (typeof time === "undefined") { time = 0; }
            this._gain.gain.value = value;
        };
        return Group;
    })(AudioCue.AQObject);
    AudioCue.Group = Group;    
    var Effect = (function (_super) {
        __extends(Effect, _super);
        function Effect(effectType, instanceName, context) {
                _super.call(this);
            this._paramMap = new Array();
            this._context = context;
            Effect.allEffects[instanceName] = this;
            this._type = effectType;
            this._instanceName = instanceName;
            this._setupNode();
        }
        Effect.allEffects = new Array();
        Effect.getEffect = function getEffect(name) {
            return Effect.allEffects[name];
        };
        Effect.prototype._setupNode = function () {
            switch(this._type) {
                case "Pan":
                    this._node = this._context.createPanner();
                    break;
                case "Lowpass":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 0;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "HighpassFilter":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 1;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "LowpassFilter":
                    console.log("lowpass created");
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 0;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "BandpassFilter":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 2;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "PeakFilter":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 5;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "LowshelfFilter":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 3;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "HighshelfFilter":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 4;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                default:
            }
        };
        Effect.prototype.getNode = function () {
            return this._node;
        };
        Effect.prototype.setParam = function (paramName, value, time) {
            if (typeof time === "undefined") { time = 0; }
            if(time == 0) {
                this._node[this._paramMap[paramName]]["value"] = value;
            } else {
                var now = this._context.currentTime;
                var ap = this._node[this._paramMap[paramName]];
                console.log(ap + " " + now + " " + time + " " + ap.value + " " + value);
                ap.cancelScheduledValues(now);
                ap.setValueAtTime(ap.value, now);
                if(this._paramMap[paramName] == "frequency") {
                    ap.exponentialRampToValueAtTime(value, now + time);
                } else {
                    ap.linearRampToValueAtTime(value, now + time);
                }
            }
            return time;
        };
        Effect.prototype.getParam = function (paramName) {
            return this._node[this._paramMap[paramName]]["value"];
        };
        return Effect;
    })(AudioCue.AQObject);
    AudioCue.Effect = Effect;    
})(AudioCue || (AudioCue = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var ArrangementController = (function (_super) {
        __extends(ArrangementController, _super);
        function ArrangementController(callback) {
                _super.call(this);
            this._domains = new Array();
            this._allArrangements = new Array();
            this._callback = callback;
        }
        ArrangementController._instance = null;
        ArrangementController.createInstance = function createInstance(callback) {
            if(!ArrangementController._instance) {
                ArrangementController._instance = new ArrangementController(callback);
            }
            return ArrangementController._instance;
        };
        ArrangementController.getInstance = function getInstance() {
            return ArrangementController._instance;
        };
        ArrangementController.prototype.createArrangement = function (arrVO) {
            var arr = new AudioCue.Arrangement(arrVO, this.cb_arrangementCallback);
            var arrName = arr.getTitle();
            this._allArrangements[arrName] = arr;
            var ds = arr.getDomain();
            if(this._domains[ds]) {
                this._domains[ds].arrangements[arrName] = arr;
            } else {
                var d = new Domain();
                d.title = ds;
                d.arrangements = new Array();
                d.arrangements[arrName] = arr;
                this._domains[ds] = d;
            }
            return arr;
        };
        ArrangementController.prototype.playArrangement = function (name, cue, returnCueStart) {
            if (typeof cue === "undefined") { cue = null; }
            if (typeof returnCueStart === "undefined") { returnCueStart = false; }
            var arr = this._allArrangements[name];
            if(!arr) {
                return 0;
            }
            var cuedArr = null;
            if(cue) {
                cuedArr = this._allArrangements[cue];
            }
            var ds = arr.getDomain();
            var domain = this._domains[ds];
            if(domain.currentArrangement == arr) {
                return 0;
            }
            domain.cuedArrangement = cuedArr;
            var time = 0;
            var retTime = 0;
            if(domain.currentArrangement) {
                retTime = time = domain.currentArrangement.stop(false);
            }
            if(returnCueStart) {
                retTime += arr.getTotalTime();
            }
            domain.currentArrangement = arr;
            arr.play(time);
            return retTime;
        };
        ArrangementController.prototype.getArrangement = function (name) {
            return this._allArrangements[name];
        };
        ArrangementController.prototype.getCurrentArrangementInDomain = function (domainName) {
            return this._domains[domainName].currentArrangement;
        };
        ArrangementController.prototype.stopDomain = function (domainName, hard) {
            var res = 0;
            if(this._domains[domainName].currentArrangement) {
                res = this._domains[domainName].currentArrangement.stop(hard);
            }
            this._domains[domainName].cuedArrangement = null;
            this._domains[domainName].currentArrangement = null;
            return res;
        };
        ArrangementController.prototype.cb_arrangementCallback = function (event, sender, val) {
            var sdomain = sender.getDomain();
            var domain = this._domains[sdomain];
            if(domain.cuedArrangement) {
                var time = sender.stop(false);
                domain.cuedArrangement.play(time);
                domain.currentArrangement = domain.cuedArrangement;
                domain.cuedArrangement = null;
            }
        };
        return ArrangementController;
    })(AudioCue.AQObject);
    AudioCue.ArrangementController = ArrangementController;    
    var Domain = (function () {
        function Domain() { }
        return Domain;
    })();
    AudioCue.Domain = Domain;    
})(AudioCue || (AudioCue = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var Arrangement = (function (_super) {
        __extends(Arrangement, _super);
        function Arrangement(vo, callback) {
                _super.call(this);
            this._playing = false;
            this._callback = callback;
            this._sequencesVO = vo.sequencesVO;
            this._domain = vo.domain;
            this._title = vo.title;
            this._sequences = new Array();
            var maxLen = 0;
            var tempId = 0;
            for(var i = 0; i < this._sequencesVO.length; i++) {
                var svo = this._sequencesVO[i];
                var s = new AudioCue.Sequence(svo, this.cb_sequenceCallback);
                this._sequences.push(s);
                var tlen = s.getLength();
                if(tlen > maxLen) {
                    maxLen = tlen;
                    tempId = i;
                }
            }
            this._longestSequence = this._sequences[tempId];
        }
        Arrangement.prototype.getDomain = function () {
            return this._domain;
        };
        Arrangement.prototype.getTitle = function () {
            return this._title;
        };
        Arrangement.prototype.play = function (offset) {
            if(this._playing) {
                return;
            }
            this._playing = true;
            for(var i = 0; i < this._sequences.length; i++) {
                this._sequences[i].play(0, offset);
            }
        };
        Arrangement.prototype.stop = function (hard) {
            if(this._playing == false) {
                return 0;
            }
            this._playing = false;
            var res = 0;
            for(var i = 0; i < this._sequences.length; i++) {
                var t = this._sequences[i].stop(hard);
                if(t > res) {
                    res = t;
                }
            }
            return res;
        };
        Arrangement.prototype.getNextStopPosition = function () {
            var res = 0;
            for(var i = 0; i < this._sequences.length; i++) {
                var t = this._sequences[i].getNextStopPosition();
                if(t > res) {
                    res = t;
                }
            }
            return res;
        };
        Arrangement.prototype.getTotalTime = function () {
            var res = 0;
            for(var i = 0; i < this._sequences.length; i++) {
                var t = this._sequences[i].getLength();
                if(t > res) {
                    res = t;
                }
            }
            return res;
        };
        Arrangement.prototype.cb_sequenceCallback = function (event, sender, val) {
            if(event == AudioCue.SequenceEvents.SEQUENCE_END) {
                if(sender == this._longestSequence) {
                    this._callback(ArrangementEvents.ARRANGEMENT_END, this, 0);
                }
            }
        };
        return Arrangement;
    })(AudioCue.AQObject);
    AudioCue.Arrangement = Arrangement;    
    var ArrangementEvents = (function () {
        function ArrangementEvents() { }
        ArrangementEvents.ARRANGEMENT_END = "arrend";
        ArrangementEvents.ARRANGEMENT_START = "arrstart";
        return ArrangementEvents;
    })();
    AudioCue.ArrangementEvents = ArrangementEvents;    
})(AudioCue || (AudioCue = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var Sequence = (function (_super) {
        __extends(Sequence, _super);
        function Sequence(sequenceVO, callback) {
                _super.call(this);
            this._currentIndex = 0;
            this._loop = sequenceVO.loop;
            this._sounds = new Array();
            this._audioSources = sequenceVO.audioSources;
            this._context = AudioCue.SoundController.getInstance().getMasterContext();
            this._playing = false;
            this._playingSounds = new Array();
            this._callback = callback;
            this._title = sequenceVO.title;
            this._group = AudioCue.Group.getGroup(sequenceVO.groupName);
            for(var i = 0; i < this._audioSources.length; i++) {
                var af = this._audioSources[i];
                var sound = AudioCue.SoundController.createSound(af, this._context, this.cb_soundCallback);
                this._sounds.push(sound);
            }
        }
        Sequence.prototype.getLength = function () {
            var res = 0;
            for(var i = 0; i < this._sounds.length; i++) {
                var sound = this._sounds[i];
                res += sound.getMusicalLength();
            }
            return res;
        };
        Sequence.prototype.play = function (index, offset) {
            if(this._playing) {
                return;
            }
            index = index % this._sounds.length;
            this._playing = true;
            this._currentIndex = index;
            this._play(offset);
        };
        Sequence.prototype._play = function (offset) {
            if(this._playing == false) {
                return;
            }
            var sound = this._sounds[this._currentIndex];
            this._currentPlayingSound = sound.play(offset, this._group);
            this._playingSounds.push(this._currentPlayingSound);
        };
        Sequence.prototype.stop = function (hard) {
            if(this._playing == false) {
                return 0;
            }
            this._playing = false;
            if(hard == false) {
                return this.getNextStopPosition();
            } else {
                for(var i = 0; i < this._playingSounds.length; i++) {
                    var p = this._playingSounds[i];
                    this._playingSounds[i].parent.stopPlayingSound(this._playingSounds[i], 0);
                }
                this._playingSounds.length = 0;
            }
        };
        Sequence.prototype.getNextStopPosition = function () {
            var currentSound = this._currentPlayingSound.parent;
            var currentTime = this._context.currentTime;
            var diff = (currentSound.getMusicalLength() + this._currentPlayingSound.startTime) - currentTime;
            return diff;
        };
        Sequence.prototype.getTitle = function () {
            return this._title;
        };
        Sequence.prototype._removeSound = function (p) {
            for(var i = 0; i < this._playingSounds.length; i++) {
                if(this._playingSounds[i] == p) {
                    this._playingSounds.splice(i, 1);
                    break;
                }
            }
        };
        Sequence.prototype.cb_soundCallback = function (event, playingSound, value) {
            if(event == AudioCue.SoundEvents.SOUND_MUSICAL_END) {
                var offset = this.getNextStopPosition();
                if(this._currentIndex == this._sounds.length - 1) {
                    if(this._callback) {
                        this._callback(SequenceEvents.SEQUENCE_END, this, 0);
                    }
                }
                this._currentIndex = (this._currentIndex + 1) % this._sounds.length;
                this._play(offset);
            }
            if(event == AudioCue.SoundEvents.SOUND_END) {
                this._removeSound(playingSound);
            }
            if(event == AudioCue.SoundEvents.SOUND_START) {
            }
        };
        return Sequence;
    })(AudioCue.AQObject);
    AudioCue.Sequence = Sequence;    
    var SequenceEvents = (function () {
        function SequenceEvents() { }
        SequenceEvents.SEQUENCE_END = "sequenceend";
        SequenceEvents.SEQUENCE_START = "seqstart";
        return SequenceEvents;
    })();
    AudioCue.SequenceEvents = SequenceEvents;    
})(AudioCue || (AudioCue = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var SoundObject = (function (_super) {
        __extends(SoundObject, _super);
        function SoundObject(vo, callback) {
                _super.call(this);
            this._lastPlayedIndex = -1;
            this._vo = vo;
            this._callback = callback;
            this._context = AudioCue.SoundController.getInstance().getMasterContext();
            this._audioSources = vo.audioSources;
            this._group = AudioCue.Group.getGroup(vo.groupName);
            this._playingSounds = new Array();
            this._sounds = new Array();
            for(var i = 0; i < this._audioSources.length; i++) {
                var af = this._audioSources[i];
                var sound = AudioCue.SoundController.createSound(af, this._context, this.cb_soundCallback);
                this._sounds.push(sound);
            }
            SoundObject._allSoundObjects[this._vo.title] = this;
        }
        SoundObject.getSoundObject = function getSoundObject(title) {
            return SoundObject._allSoundObjects[title];
        };
        SoundObject._allSoundObjects = new Array();
        SoundObject.prototype.play = function () {
            var index = 0;
            if(this._sounds.length > 1) {
                if(this._vo.type == SoundObjectTypes.RANDOMTRIG) {
                    index = this._lastPlayedIndex;
                    while(index == this._lastPlayedIndex) {
                        index = Math.ceil(Math.random() * this._sounds.length);
                    }
                } else if(this._vo.type == SoundObjectTypes.STEPTRIG) {
                    index = (this._lastPlayedIndex + 1) % (this._sounds.length - 1);
                }
            }
            this._playingSounds.push(this._sounds[index].play(0, this._group));
            this._lastPlayedIndex = index;
        };
        SoundObject.prototype.stop = function () {
            for(var i = 0; i < this._playingSounds.length; i++) {
                var p = this._playingSounds[i];
                this._playingSounds[i].parent.stopPlayingSound(this._playingSounds[i], 0);
            }
            this._playingSounds.length = 0;
        };
        SoundObject.prototype.cb_soundCallback = function (event, playingSound, value) {
            if(event == AudioCue.SoundEvents.SOUND_END) {
                this._removeSound(playingSound);
            }
        };
        SoundObject.prototype._removeSound = function (p) {
            for(var i = 0; i < this._playingSounds.length; i++) {
                if(this._playingSounds[i] == p) {
                    this._playingSounds.splice(i, 1);
                    break;
                }
            }
        };
        return SoundObject;
    })(AudioCue.AQObject);
    AudioCue.SoundObject = SoundObject;    
    var SoundObjectTypes = (function () {
        function SoundObjectTypes() { }
        SoundObjectTypes.RANDOMTRIG = 0;
        SoundObjectTypes.STEPTRIG = 1;
        return SoundObjectTypes;
    })();
    AudioCue.SoundObjectTypes = SoundObjectTypes;    
})(AudioCue || (AudioCue = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var Sound = (function (_super) {
        __extends(Sound, _super);
        function Sound(audioFile, context, callback) {
                _super.call(this);
            this._idCount = 0;
            this._audioFile = audioFile;
            this._callback = callback;
            this._ac = context;
        }
        Sound.prototype.getDuration = function () {
            return this._audioFile.buffer.duration;
        };
        Sound.prototype.getMusicalLength = function () {
            return this._audioFile.soundVO.musicalLength;
        };
        Sound.prototype.getContext = function () {
            return this._ac;
        };
        Sound.prototype.play = function (time, group) {
            if (typeof group === "undefined") { group = null; }
            var source = this._ac.createBufferSource();
            source.buffer = this._audioFile.buffer;
            if(group) {
                source.connect(group.getNode());
            } else {
                source.connect(this._ac.destination);
            }
            source.noteOn(this._ac.currentTime + time);
            var p = AudioCue.PoolController.getObject(AudioCue.PlayingSound);
            p.id = this._idCount++;
            p.source = source;
            p.isPlaying = true;
            p.startTime = this._ac.currentTime + time;
            p.parent = this;
            p.startListening(this.cb_soundCallback);
            return p;
        };
        Sound.prototype.cb_soundCallback = function (event, p, arg) {
            var self = p.parent;
            if(this._callback) {
                this._callback(event, p, arg);
            }
        };
        Sound.prototype.stopPlayingSound = function (p, time) {
            p.source.noteOff(0);
            p.isPlaying = false;
            AudioCue.SoundController.getInstance().removePlayingSound(p);
        };
        return Sound;
    })(AudioCue.AQObject);
    AudioCue.Sound = Sound;    
})(AudioCue || (AudioCue = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var Silence = (function (_super) {
        __extends(Silence, _super);
        function Silence(audioFile, ctx, callback) {
                _super.call(this);
            this._idCount = 0;
            this._audioSource = audioFile;
            this._callback = callback;
            this._ac = ctx;
        }
        Silence.prototype.getDuration = function () {
            return this._audioSource.soundVO.musicalLength + AudioCue.SoundController.LOOKAHEAD;
        };
        Silence.prototype.getMusicalLength = function () {
            return this._audioSource.soundVO.musicalLength;
        };
        Silence.prototype.getContext = function () {
            return this._ac;
        };
        Silence.prototype.play = function (time, group) {
            if (typeof group === "undefined") { group = null; }
            var p = AudioCue.PoolController.getObject(AudioCue.PlayingSound);
            p.id = this._idCount++;
            p.source = null;
            p.isPlaying = true;
            p.startTime = this._ac.currentTime + time;
            p.parent = this;
            p.startListening(this.cb_soundCallback);
            return p;
        };
        Silence.prototype.cb_soundCallback = function (event, p, arg) {
            var self = p.parent;
            if(this._callback) {
                this._callback(event, p, arg);
            }
        };
        Silence.prototype.stopPlayingSound = function (p, time) {
            p.isPlaying = false;
            AudioCue.SoundController.getInstance().removePlayingSound(p);
        };
        return Silence;
    })(AudioCue.AQObject);
    AudioCue.Silence = Silence;    
})(AudioCue || (AudioCue = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var AQController = (function (_super) {
        __extends(AQController, _super);
        function AQController(arg1, arg2, arg3, arg4) {
                _super.call(this);
            this._currentJSONIndex = 0;
            this._ready = false;
            this._audioLoaderProgress = 0;
            this._dataProgress = 0;
            AudioCue.PoolController.createPool(AudioCue.PlayingSound, null, 64);
            this._soundController = AudioCue.SoundController.createInstance(null);
            this._soundController.start();
            this._eventController = AudioCue.EventController.getInstance();
            this._arrangementController = AudioCue.ArrangementController.createInstance(null);
            if(arg4 != null) {
                this._mode = 0;
                this._jsonFiles = arg1;
                this._basePath = arg2;
                this._assetExtension = arg3;
                this._callback = arg4;
                this._parser = new AudioCue.Parser(this._assetExtension, this._basePath, this.cb_parser);
            } else {
                this._mode = 1;
                this._assetExtension = ".mp3";
                this._base64FileUrl = arg1;
                this._jsonFiles = arg2;
                this._callback = arg3;
                this._parser = new AudioCue.Parser(this._assetExtension, "", this.cb_parser);
            }
        }
        AQController._instance = null;
        AQController.createInstance = function createInstance(arg1, arg2, arg3, arg4) {
            if(!AQController._instance) {
                AQController._instance = new AQController(arg1, arg2, arg3, arg4);
            }
            return AQController._instance;
        };
        AQController.getInstance = function getInstance() {
            return AQController._instance;
        };
        AQController.prototype.init = function () {
            if(this._mode == 0) {
                this._parser.parseUrl(this._jsonFiles[this._currentJSONIndex]);
                this._currentJSONIndex++;
            } else if(this._mode == 1) {
                var req = new XMLHttpRequest();
                var self = this;
                req.open("GET", this._base64FileUrl, true);
                req.onload = function () {
                    var json = JSON.parse(req.responseText);
                    for(var i = 0; i < self._jsonFiles.length; i++) {
                        var jsonstring = atob(json["files"][self._jsonFiles[i]]);
                        self._parser.parseString(jsonstring);
                    }
                    var events = self._parser.getEvents();
                    for(var i = 0; i < events.length; i++) {
                        self._eventController.addEvent(events[i]);
                    }
                    self._audioLoader = new AudioCue.AudioLoader(self.cb_audioloader);
                    self._audioLoader.addFiles(self._parser.getSoundsVO());
                    self._audioLoader.preloadAll(json);
                };
                req.onprogress = function (evt) {
                    self._dataProgress = (evt.loaded / evt.total) * 0.5;
                    self._callback(AudioCueEvents.PROGRESS, self._dataProgress + self._audioLoaderProgress);
                };
                req.onreadystatechange = function (oEvent) {
                };
                req.send();
            }
        };
        AQController.prototype.isReady = function () {
            return this._ready;
        };
        AQController.prototype.getEvents = function () {
            return this._eventController.getEvents();
        };
        AQController.prototype.dispatchEvent = function (event, arg) {
            if (typeof arg === "undefined") { arg = null; }
            return this._eventController.dispatchEvent(event, arg);
        };
        AQController.prototype.cb_parser = function (progress) {
            if(this._mode == 1) {
                return;
            }
            if(progress == 1) {
                if(this._jsonFiles.length == this._currentJSONIndex) {
                    this._dataProgress = 0.5;
                    this._callback(AudioCueEvents.PROGRESS, this._dataProgress + this._audioLoaderProgress);
                    var events = this._parser.getEvents();
                    for(var i = 0; i < events.length; i++) {
                        this._eventController.addEvent(events[i]);
                    }
                    this._audioLoader = new AudioCue.AudioLoader(this.cb_audioloader);
                    this._audioLoader.addFiles(this._parser.getSoundsVO());
                    this._audioLoader.preloadAll();
                } else {
                    this._dataProgress = (this._currentJSONIndex / this._jsonFiles.length) * 0.5;
                    this._callback(AudioCueEvents.PROGRESS, this._dataProgress + this._audioLoaderProgress);
                    this._parser.parseUrl(this._jsonFiles[this._currentJSONIndex]);
                    this._currentJSONIndex++;
                }
            }
        };
        AQController.prototype.cb_audioloader = function (af, itemsLeft) {
            var totalItems = this._parser.getNumberOfSounds();
            var progress = 1 - (itemsLeft / totalItems);
            this._audioLoaderProgress = progress * 0.5;
            this._callback(AudioCueEvents.PROGRESS, this._dataProgress + this._audioLoaderProgress);
            if(itemsLeft == 0) {
                var allBuffers = this._audioLoader.getAudioSourcesMap();
                var sequencesVO = this._parser.getSequencesVO();
                for(var prop in sequencesVO) {
                    var sevo = sequencesVO[prop];
                    sevo.audioSources = new Array();
                    for(var j = 0; j < sevo.soundsVO.length; j++) {
                        var sovo = sevo.soundsVO[j];
                        sevo.audioSources.push(allBuffers[sovo.name]);
                    }
                }
                var soundObjectsVO = this._parser.getSoundObjectsVO();
                for(var prop in soundObjectsVO) {
                    var sobvo = soundObjectsVO[prop];
                    sobvo.audioSources = new Array();
                    for(var j = 0; j < sevo.soundsVO.length; j++) {
                        var sovo = sobvo.soundsVO[j];
                        sobvo.audioSources.push(allBuffers[sovo.name]);
                    }
                    new AudioCue.SoundObject(sobvo, null);
                }
                var arrsVO = this._parser.getArrangementsVO();
                for(var prop in arrsVO) {
                    this._arrangementController.createArrangement(arrsVO[prop]);
                }
                this._ready = true;
                this._callback(AudioCueEvents.READY, 0);
            }
        };
        return AQController;
    })(AudioCue.AQObject);
    AudioCue.AQController = AQController;    
    var AudioCueEvents = (function () {
        function AudioCueEvents() { }
        AudioCueEvents.READY = "aqready";
        AudioCueEvents.PROGRESS = "aqprogress";
        return AudioCueEvents;
    })();
    AudioCue.AudioCueEvents = AudioCueEvents;    
})(AudioCue || (AudioCue = {}));
