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
