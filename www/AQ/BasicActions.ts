///<reference path='ArrangementController.ts' />
///<reference path='SoundObject.ts' />
///<reference path='Group.ts' />
///<reference path='EventController.ts' />

module AudioCue {
	var PlayArrAction:IAction = function(args:any, devArgs:any):number {
		var ac:ArrangementController = ArrangementController.getInstance();
		var name:string = args["name"];
		var cue:string = null;
		if (args["cue"]) cue = args["cue"];
		var retCueStart:bool = (args["retCueStart"] == "1");
		return ac.playArrangement(name, cue, retCueStart);
	}
	EventController.getInstance().addAction(PlayArrAction, "PlayArrAction");

	var StopDomainAction:IAction = function(args:any, devArgs:any):number {
		var ac:ArrangementController = ArrangementController.getInstance();
		var name:string = args["name"];
		var hard:bool = (args["hard"] == "1");
		//console.log(name + " " + hard);
		return ac.stopDomain(name, hard);
	}
	EventController.getInstance().addAction(StopDomainAction, "StopDomainAction");

	var StartSOAction:IAction = function(args:any, devArgs:any):number {
		var so:SoundObject = SoundObject.getSoundObject(args["name"]);
		so.play();
		return 0;
	}
	EventController.getInstance().addAction(StartSOAction, "StartSOAction");

	var StopSOAction:IAction = function(args:any, devArgs:any):number {
		var so:SoundObject = SoundObject.getSoundObject(args["name"]);
		so.stop();
		return 0;
	}
	EventController.getInstance().addAction(StopSOAction, "StopSOAction");

	var EffectParamAction:IAction = function(args:any, devArgs:any):number {
		//name, param, value, time
		var e:Effect = Effect.getEffect(args["name"]);
		return e.setParam(args["param"], parseFloat(args["value"]), parseFloat(args["time"]));
	}
	EventController.getInstance().addAction(EffectParamAction, "EffectParamAction");
}