/*
Copyright (c) 2013 Johan Sundhage (Klevgränd Produktion AB)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
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