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
