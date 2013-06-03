var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AudioCue;
(function (AudioCue) {
    var EventController = (function (_super) {
        __extends(EventController, _super);
        function EventController() {
                _super.call(this);
            this._actions = new Array();
            this._events = new Array();
        }
        EventController._instance = null;
        EventController.createInstance = function createInstance() {
            if(!EventController._instance) {
                EventController._instance = new EventController();
            }
            return EventController._instance;
        };
        EventController.getInstance = function getInstance() {
            return EventController._instance;
        };
        EventController.prototype.addEvent = function (event) {
            this._events[event.name] = event;
        };
        EventController.prototype.addAction = function (action, name) {
            this._actions[name] = action;
        };
        EventController.prototype.haveAction = function (actionName) {
            return (this._actions[actionName] != undefined);
        };
        EventController.prototype.getEvents = function () {
            return this._events;
        };
        EventController.prototype.dispatchEvent = function (eventName, devArgs) {
            if (typeof devArgs === "undefined") { devArgs = null; }
            var event = this._events[eventName];
            var ret = 0;
            for(var i = 0; i < event.actionsAndArgs.length; i++) {
                var val = this._actions[event.actionsAndArgs[i].actionName](event.actionsAndArgs[i].args, devArgs);
                if(val > ret) {
                    ret = val;
                }
            }
            return ret;
        };
        return EventController;
    })(AudioCue.AQObject);
    AudioCue.EventController = EventController;    
    var ActionAndArg = (function () {
        function ActionAndArg() { }
        return ActionAndArg;
    })();
    AudioCue.ActionAndArg = ActionAndArg;    
    var AQEvent = (function () {
        function AQEvent() { }
        return AQEvent;
    })();
    AudioCue.AQEvent = AQEvent;    
    EventController.createInstance();
})(AudioCue || (AudioCue = {}));
