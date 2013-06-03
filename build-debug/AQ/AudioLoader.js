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
