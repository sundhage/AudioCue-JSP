var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group(name, context, gain) {
            if (typeof gain === "undefined") { gain = 1; }
                _super.call(this);
            this._effects = new Array();
            Group.allGroups[name] = this;
            this._context = context;
            if(this._context.createGain) {
                this._gain = this._context.createGain();
            } else {
                this._gain = this._context.createGainNode();
            }
            this._gain.gain.value = gain;
            this._lastNode = this._gain;
            this._gain.connect(this._context.destination);
        }
        Group.allGroups = new Array();
        Group.getGroup = function getGroup(name) {
            return Group.allGroups[name];
        };
        Group.prototype.getNode = function () {
            return this._gain;
        };
        Group.prototype.addEffect = function (effectType, instanceName) {
            var ef = new Effect(effectType, instanceName, this._context);
            ef.getNode().connect(this._context.destination);
            this._lastNode.disconnect();
            this._lastNode.connect(ef.getNode());
            this._lastNode = ef.getNode();
            this._effects.push(ef);
            return ef;
        };
        Group.prototype.setGain = function (value, time) {
            if (typeof time === "undefined") { time = 0; }
            this._gain.gain.value = value;
        };
        return Group;
    })(AudioCue.AQObject);
    AudioCue.Group = Group;    
    var Effect = (function (_super) {
        __extends(Effect, _super);
        function Effect(effectType, instanceName, context) {
                _super.call(this);
            this._paramMap = new Array();
            this._context = context;
            Effect.allEffects[instanceName] = this;
            this._type = effectType;
            this._instanceName = instanceName;
            this._setupNode();
        }
        Effect.allEffects = new Array();
        Effect.getEffect = function getEffect(name) {
            return Effect.allEffects[name];
        };
        Effect.prototype._setupNode = function () {
            switch(this._type) {
                case "Pan":
                    this._node = this._context.createPanner();
                    break;
                case "Lowpass":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 0;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "HighpassFilter":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 1;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "LowpassFilter":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 0;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "BandpassFilter":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 2;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "PeakFilter":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 5;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "LowshelfFilter":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 3;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                case "HighshelfFilter":
                    this._node = this._context.createBiquadFilter();
                    this._node["type"] = 4;
                    this._paramMap["freq"] = "frequency";
                    this._paramMap["detune"] = "detune";
                    this._paramMap["resonance"] = "Q";
                    this._paramMap["gain"] = "gain";
                    break;
                default:
            }
        };
        Effect.prototype.getNode = function () {
            return this._node;
        };
        Effect.prototype.setParam = function (paramName, value, time) {
            if (typeof time === "undefined") { time = 0; }
            if(time == 0) {
                this._node[this._paramMap[paramName]]["value"] = value;
            } else {
                var now = this._context.currentTime;
                var ap = this._node[this._paramMap[paramName]];
                ap.cancelScheduledValues(now);
                ap.setValueAtTime(ap.value, now);
                if(this._paramMap[paramName] == "frequency") {
                    ap.exponentialRampToValueAtTime(value, now + time);
                } else {
                    ap.linearRampToValueAtTime(value, now + time);
                }
            }
            return time;
        };
        Effect.prototype.getParam = function (paramName) {
            return this._node[this._paramMap[paramName]]["value"];
        };
        return Effect;
    })(AudioCue.AQObject);
    AudioCue.Effect = Effect;    
})(AudioCue || (AudioCue = {}));
