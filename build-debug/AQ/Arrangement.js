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
