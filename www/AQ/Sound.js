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
