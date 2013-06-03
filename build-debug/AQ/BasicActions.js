var AudioCue;
(function (AudioCue) {
    var PlayArrAction = function (args, devArgs) {
        var ac = AudioCue.ArrangementController.getInstance();
        var name = args["name"];
        var cue = null;
        if(args["cue"]) {
            cue = args["cue"];
        }
        var retCueStart = (args["retCueStart"] == "1");
        return ac.playArrangement(name, cue, retCueStart);
    };
    AudioCue.EventController.getInstance().addAction(PlayArrAction, "PlayArrAction");
    var StopDomainAction = function (args, devArgs) {
        var ac = AudioCue.ArrangementController.getInstance();
        var name = args["name"];
        var hard = (args["hard"] == "1");
        return ac.stopDomain(name, hard);
    };
    AudioCue.EventController.getInstance().addAction(StopDomainAction, "StopDomainAction");
    var StartSOAction = function (args, devArgs) {
        var so = AudioCue.SoundObject.getSoundObject(args["name"]);
        so.play();
        return 0;
    };
    AudioCue.EventController.getInstance().addAction(StartSOAction, "StartSOAction");
    var StopSOAction = function (args, devArgs) {
        var so = AudioCue.SoundObject.getSoundObject(args["name"]);
        so.stop();
        return 0;
    };
    AudioCue.EventController.getInstance().addAction(StopSOAction, "StopSOAction");
    var EffectParamAction = function (args, devArgs) {
        var e = AudioCue.Effect.getEffect(args["name"]);
        return e.setParam(args["param"], parseFloat(args["value"]), parseFloat(args["time"]));
    };
    AudioCue.EventController.getInstance().addAction(EffectParamAction, "EffectParamAction");
})(AudioCue || (AudioCue = {}));
