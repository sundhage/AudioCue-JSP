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
