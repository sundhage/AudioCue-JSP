/*
Copyright (c) 2013, Johan Sundhage (Klevgränd Produktion AB)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL DANIEL GUERRERO BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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