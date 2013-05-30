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
