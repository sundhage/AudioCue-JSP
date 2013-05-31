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
///<reference path='AQObject.ts' />
///<reference path='AQStructs.ts' />
///<reference path='Sound.ts' />
///<reference path='Group.ts' />
///<reference path='Sequence.ts' />
///<reference path='SoundObject.ts' />
///<reference path='Arrangement.ts' />
///<reference path='EventController.ts' />


module AudioCue {
	/**
		Parses .json content into different value objects.
	*/

 	export class Parser extends AQObject {
 		private _callback:ParserCallback;
 		private _extension:string;
 		//private _url:string;

 		private _events:AQEvent[];
 		private _didParseEvents:bool = false;

 		private _sounds:SoundVO[];
 		private _soundsCount:number;

 		private _basePath:string;

 		private _sequences:SequenceVO[];
 		private _soundObjects:SoundObjectVO[];

 		private _arrangements:ArrangementVO[];

 		/**
			@param extension file type. (".mp3" for mp3 files etc)
			@param basePath path to content folder
			@param callback Callback function (for progress and on finish)
 		*/
 		constructor(extension:string, basePath:string, callback:ParserCallback) {
 			super();
 			this._basePath = basePath;

 			this._sounds = new Array();
 			this._sequences = new Array();
 			this._arrangements = new Array();
 			this._soundObjects = new Array();
 			this._events = new Array();
 			this._callback = callback;
 			//this._url = url;
 			this._extension = extension;


 		}
 		/**
			returns total number of ISound's
 		*/
 		public getNumberOfSounds():number {
 			return this._soundsCount;
 			
 		}
 		/**
			Returns true if SoundVO's are created.
 		*/
 		public haveSoundData():bool {
 			return (this._sounds.length > 0);
 		}
 		/**
			Returns true if events are parsed and created.
 		*/
 		public haveEventData():bool {
 			return this._didParseEvents;
 		}

 		/**
			Parses the content of a file url asynchroniously. (will fire an event when finished)
 		*/

 		public parseUrl(url:string):void {
			var req:XMLHttpRequest = new XMLHttpRequest();
			var self:Parser = this;
			req.open("GET", url, true);
			req.onload = function() {
				self.cb_loaded(JSON.parse(req.responseText));
			}

			req.onreadystatechange = function (oEvent) {
				// errorhantera requestet här
			}

			req.send();

 		}
 		/**
			Parses a string of json data
 		*/
 		public parseString(jsonData:string):void {
 			this.cb_loaded(JSON.parse(jsonData));
 		}

 		private cb_loaded(json:Array) {
 			if (json["root"]) json = json["root"];

 			if (json["soundData"]) {
 				this._parseSoundData(json);
 			}
 			if (json["eventData"]) {
 				this._parseEventData(json);
 			}
 			if (json["groupData"]) {
 				this._parseGroupData(json);
 			}
 		}

 		// also creates group data... 
 		private _parseGroupData(json:Array) {
 			var context:webkitAudioContext = SoundController.getInstance().getMasterContext();

 			//console.log(json);
 			var groups:any[] = this._arrayify(json["groupData"]["group"]);
 			for (var i:number = 0; i<groups.length; i++) {
 				var groupName:string = groups[i]["-name"];
 				var volume:number = parseFloat(groups[i]["volume"]);
 				var g:Group = new Group(groupName, context, volume);

 				var effects:any[] = this._arrayify(groups[i]["effects"]["effect"]);
 				for (var j:number = 0; j<effects.length; j++) {
 					var ename:string = effects[j]["-id"];
 					var iname:string = effects[j]["-instance"];

 					var e:Effect = g.addEffect(ename, iname);
 					var params:any[] = this._arrayify(effects[j]["param"]);
 					for (var k:number = 0; k<params.length; k++) {
 						e.setParam(params[k]["-key"], parseFloat(params[k]["-value"]));
 					}
 				}
 			}
 			this._callback(1);

 		}
 		private _parseEventData(json:Array) {
 			// whoops.. this is bad structure, but wtf...
 			var events:any[] = this._arrayify(json["eventData"].action);

 			//console.log(events);

 			for (var i:number = 0; i<events.length; i++) {
 				var e:any[] = events[i];
 				var eventName:string = e["event"];
 				var actionsAndArgs:ActionAndArg[] = new Array();

 				var targets:any[] = this._arrayify(e["targets"].target);
 				for (var j:number = 0; j<targets.length; j++) {
 					var target:any[] = targets[j];
 					var actionName:string = target["-id"];
 					if (EventController.getInstance().haveAction(actionName) == false) {
 						console.log("AudioCue: action ["+actionName+"] is not implemented.");
 						continue;
 					}
 					var args:any[] = this._arrayify(target["arg"]);

 					// valid for AQ
 					var outArgs:any = new Array();
 					for (var k:number = 0; k<args.length; k++) {
 						outArgs[args[k]["-key"]] = args[k]["-value"];
 					}
 					var actionAndArg:ActionAndArg = new ActionAndArg;
 					actionAndArg.actionName = actionName;
 					actionAndArg.args = outArgs;
 					actionsAndArgs.push(actionAndArg);
 				}
 				this._didParseEvents = true;
 				if (actionsAndArgs.length > 0) {
 					var theEvent:AQEvent = new AQEvent();
 					theEvent.name = eventName;
 					theEvent.actionsAndArgs = actionsAndArgs;
 					this._events.push(theEvent);
 				} else {
 					console.log("AudioCue: event ["+eventName+"] has no valid actions.");
 				}

 				//console.log(targets);
 			}


 			this._callback(1);

 		}

 		private _parseSoundData(json:Array) {
 			var sounds:Array = json["soundData"].sound;
 			this._soundsCount = sounds.length;

 			for (var i:number = 0; i<sounds.length; i++) {
 				var sLength:string = sounds[i].length;
 				var sName:string = sounds[i].name;
 				var sType:string = sounds[i].type;
 				var svo:SoundVO = new SoundVO();
 				svo.type = parseInt(sType);
 				if (isNaN(svo.type)) svo.type = SoundVO.SOUND_TYPE_AUDIOFILE;
 				svo.name = sName;

 				// OBS! Pathify somewhere else??
 				svo.path = this._basePath+sName+this._extension;


 				if (sLength.search(",") > -1) {
 					var aLength:string[] = sLength.split(",");
 					var tempo:number = parseFloat(aLength[0]);
 					var beats:number = parseFloat(aLength[1]);

 					svo.musicalLength = (60/tempo)*beats;
 					// tempo based..
 				} else {
 					svo.musicalLength = parseFloat(sLength);

 				}

 				this._sounds[svo.name] = svo;

 				//console.log(svo.path + " -> " + svo.musicalLength);

 			}

 			var soundObjects:Array = json["soundData"].soundObject;
 			for (var i:number = 0; i<soundObjects.length; i++) {
 				var group:string = soundObjects[i].group;
 				var loop:bool = true;
 				if (parseInt(soundObjects[i].loop) == 0) loop = false;
 				var name:string = soundObjects[i].name;
 				var pan:number = parseFloat(soundObjects[i].pan);
 				var parentBus:string = soundObjects[i].parentBus;
 				var volume:number = parseFloat(soundObjects[i].volume);

 				var soundList:any[];

				if (typeof soundObjects[i].sound.length === 'undefined' ) {
					soundList = new Array();

					soundList.push(soundObjects[i].sound);
					//console.log("Single sound");
				} else {
 
 					soundList = soundObjects[i].sound;
				}

 				if (soundObjects[i].mode == SoundObjectStringType.PATTERN) {
 					var sevo:SequenceVO = new SequenceVO();
 					sevo.loop = loop;
 					sevo.title = name;
 					sevo.groupName = group;
 					sevo.soundsVO = new Array();

 					for (var j:number = 0; j<soundList.length; j++) {
 						sevo.soundsVO.push(this._sounds[soundList[j]["#text"]]);
 					} 
 					this._sequences[sevo.title] = sevo;
 				} else {
 					// todo: create soundobject vo's..
 					var sovo:SoundObjectVO = new SoundObjectVO;
 					sovo.title = name;
 					sovo.type = SoundObjectTypes.STEPTRIG;
 					sovo.groupName = group;
 					if (soundObjects[i].mode == SoundObjectStringType.RANDOMTRIG) sovo.type = SoundObjectTypes.RANDOMTRIG;
 					sovo.soundsVO = new Array();
 					for (var j:number = 0; j<soundList.length; j++) {
 						sovo.soundsVO.push(this._sounds[soundList[j]["#text"]]);
 					} 
 					this._soundObjects[sovo.title] = sovo;

 				}
 			}
 			var arrangements:Array = json["soundData"].arrangement;

 			for (var i:number = 0; i<arrangements.length; i++) {
 				var name:string = arrangements[i].name;
 				var domain:string = arrangements[i].domain;
 				var retrigg:bool = false;
 				if (parseInt(arrangements[i].retrigg) == 1) retrigg = true;
 				var seqNames:any[];
 				var seqs:SequenceVO[] = new Array();
 				if (typeof arrangements[i].soundObject === 'string' ) {
 					seqNames = new Array();
 					//this._keepAlive.push(seqNames);
 					seqNames.push(arrangements[i].soundObject);
 				} else {
 					seqNames = arrangements[i].soundObject;
 				}
 				for (var j:number = 0; j<seqNames.length; j++) {
 					if (seqNames[j]["-upbeat"]) console.log("AudioCue: sequence ["+name+"] has upbeat, skipping");
 					else {
 						seqs.push(this._sequences[seqNames[j]]);
 						//console.log(name + " -> " + seqNames[j]);
 					}
 				}
 				var avo:ArrangementVO = new ArrangementVO;
 				avo.sequencesVO = seqs;
 				avo.title = name;
 				avo.domain = domain;
 				this._arrangements[avo.title] = avo;

 			}
 			this._callback(1);

 			// todo: load sound assets and update all sequenceVO's with its proper AudioFile array

 			//console.log(arrangements);
 			//console.log(soundObjects);
 			//console.log(sounds);
 		}
 		private _arrayify(obj:any):any[] {
 			var newObj:any[];
 			if (obj.length == undefined) {
				newObj = new Array();
				newObj.push(obj);
				return newObj;
			} else {
				return obj;
			}

 		}
 		/**
			returns a hashmap (Object) of all the SoundVO instances. Key is the sounds' name.
 		*/
 		public getSoundsVO():SoundVO[] {
 			return this._sounds;
 		}
 		/**
		returns a hashmap (Object) of all the SequenceVO instances. Key is the sequences name.
 		*/
 		public getSequencesVO():SequenceVO[] {
 			return this._sequences;
 		}
 		/**
		returns a hashmap (Object) of all the ArrangementVO instances. Key is the arrangements name.
 		*/
 		public getArrangementsVO():ArrangementVO[] {
 			return this._arrangements;
 		}
 		/**
		returns a hashmap (Object) of all the SoundObjectVO instances. Key is the soundobjects name.
 		*/
 		public getSoundObjectsVO():SoundObjectVO[] {
 			return this._soundObjects;
 		}

 		/**
		returns a hashmap (Object) of all the AQEvent instances. Key is the events name.
 		*/
 		public getEvents():AQEvent[] {
 			return this._events;
 		}

	} 
	/**
		A holder of static strings which contain valid SoundObjectString types (used in .json files) names.
	*/
	class SoundObjectStringType {
		/**
			The soundobject is a Sequence
		*/
		static PATTERN:string = "pattern";
		/**
			The soundobject is a SoundObject with subtype steptrig
		*/
		static STEPTRIG:string = "steptrig";
		/**
			The soundobject is a SoundObject with subtype randomtrig
		*/
		static RANDOMTRIG:string = "randomtrig";

	}
	/**
		Parser callback type definition.
	*/
	export interface ParserCallback {
		/**
			@param progress indicates current progress (value between 0 and 1). If 1 -> Parser is ready with everything.
		*/
		(progress:number):void;
	}
}