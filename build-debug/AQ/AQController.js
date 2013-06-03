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
