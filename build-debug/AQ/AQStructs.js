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
