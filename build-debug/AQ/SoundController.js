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
