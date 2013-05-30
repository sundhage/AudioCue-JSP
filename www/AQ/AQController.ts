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
///<reference path='AudioLoader.ts' />
///<reference path='Parser.ts' />
///<reference path='EventController.ts' />
///<reference path='BasicActions.ts' />

///<reference path='Sound.ts' />
///<reference path='SoundObject.ts' />
///<reference path='Sequence.ts' />
///<reference path='Arrangement.ts' />
///<reference path='ArrangementController.ts' />
///<reference path='SoundController.ts' />
///<reference path='PoolController.ts' />

///<reference path='../typings/waa-nightly.d.ts' />


// holds Base64 json data when injecting via DOM...

var aqcontent:any[] = new Array();

module AudioCue {
 	export class AQController extends AQObject {
		private static _instance:AQController = null;

		public static createInstance(jsonFileURLs:string[], basePath:string, assetExtension:string, callback:AudioCueCallback):AQController;
		public static createInstance(base64FileUrl:string, jsonFilenames:string[], callback:AudioCueCallback):AQController;
		public static createInstance(arg1:any, arg2:any, arg3?:any, arg4?:any) {
			if (!_instance) {
				_instance = new AQController(arg1, arg2, arg3, arg4);
			}
			return _instance;

		}

	 	static getInstance():AQController { return _instance; }

	 	private _base64FileUrl:string;

	 	private _jsonFiles:string[];
	 	private _currentJSONIndex:number = 0;

	 	private _basePath:string;
	 	private _assetExtension:string;

	 	private _soundController:SoundController;
	 	private _eventController:EventController;
	 	private _arrangementController:ArrangementController;

	 	private _parser:Parser;

	 	private _audioLoader:AudioLoader;

	 	private _ready:bool = false;

	 	private _mode:number;

	 	private _audioLoaderProgress:number = 0;
	 	private _dataProgress:number = 0;




	 	// fix later on...
	 	private _callback:AudioCueCallback;

	 	constructor(jsonFileURLs:string[], basePath:string, assetExtension:string, callback:AudioCueCallback);
	 	constructor(base64FileUrl:string, jsonFilenames:string[], callback:AudioCueCallback);
	 	constructor(arg1:any, arg2:any, arg3?:any, arg4?:any) {
	 		super();
	 		
	 		// create a pool
	 		PoolController.createPool(PlayingSound, null, 64);

			this._soundController = SoundController.createInstance(null);
			this._soundController.start();
			this._eventController = EventController.getInstance();
			this._arrangementController = ArrangementController.createInstance(null);

			// ugly check but works for now..
	 		if (arg4 != null) {
	 			this._mode = 0;

	 			// non-base64
		 		this._jsonFiles = arg1;
		 		this._basePath = arg2;
		 		this._assetExtension = arg3;
		 		this._callback = arg4;


				this._parser = new Parser(this._assetExtension, this._basePath, this.cb_parser);
			} else {
				this._mode = 1;
				// fix
				this._assetExtension = ".mp3";
				this._base64FileUrl = arg1;
				this._jsonFiles = arg2;
				this._callback = arg3;

				// fix (overload? flag?)
				this._parser = new Parser(this._assetExtension, "", this.cb_parser);
			}

	 	}

	 	public init():void {
	 		if (this._mode == 0) {
	 			this._parser.parseUrl(this._jsonFiles[this._currentJSONIndex]);
	 			this._currentJSONIndex++;
	 		} else if (this._mode == 1) {

	 			// JSON BINARY FILE OPENER..



	 			// the DOM way..
	 			/*
				var self:AQController = this;

	 			var head = document.getElementsByTagName('head')[0];
				var script:any= document.createElement('script');
				console.log(script);
				script.type= 'text/javascript';
				script.onload = function() {
					//console.log(aqcontent[self._base64FileUrl]);
					var json = JSON.parse(aqcontent[self._base64FileUrl]);
					for (var i:number = 0; i<self._jsonFiles.length; i++) {
						var jsonstring:string = atob(json["files"][self._jsonFiles[i]]);
						self._parser.parseString(jsonstring);
					}
					var events:AQEvent[] = self._parser.getEvents();
					for (var i:number = 0; i<events.length; i++) {
						//console.log(events[i].actionsAndArgs);
						self._eventController.addEvent(events[i]);
					}
					self._dataProgress = 0.5;
					self._audioLoader = new AudioLoader(self.cb_audioloader);
					self._audioLoader.addFiles(self._parser.getSoundsVO());
					self._audioLoader.preloadAll(json);

					//console.log("Onload: "+aqcontent[this._base64FileUrl]);
				}

				// not happening..??
				script.onprogress = function(evt:any) {
					console.log("progress: "+ evt.loaded / evt.total);
				}
				//console.log(this._base64FileUrl);
				script.src= this._base64FileUrl;
				head.appendChild(script);
				*/


	 			// the XMLHttpRequest way...
	 			
				var req:XMLHttpRequest = new XMLHttpRequest();
				var self:AQController = this;
				req.open("GET", this._base64FileUrl, true);
				req.onload = function() {
					var json = JSON.parse(req.responseText);
					for (var i:number = 0; i<self._jsonFiles.length; i++) {
						var jsonstring:string = atob(json["files"][self._jsonFiles[i]]);
						self._parser.parseString(jsonstring);
					}
					var events:AQEvent[] = self._parser.getEvents();
					for (var i:number = 0; i<events.length; i++) {
						//console.log(events[i].actionsAndArgs);
						self._eventController.addEvent(events[i]);
					}

					self._audioLoader = new AudioLoader(self.cb_audioloader);
					self._audioLoader.addFiles(self._parser.getSoundsVO());
					self._audioLoader.preloadAll(json);

					//self.cb_loaded(JSON.parse(req.responseText));
				}
				req.onprogress = function(evt:any) {
					self._dataProgress = (evt.loaded / evt.total) * 0.5;
					self._callback(AudioCueEvents.PROGRESS, self._dataProgress + self._audioLoaderProgress);

				}
				req.send();
				
	 		}
	 	}

	 	public isReady():bool { return this._ready; }

	 	public getEvents():AQEvent[] {
	 		return this._eventController.getEvents();
	 	}

	 	public dispatchEvent(event:string, arg?:any = null):number {
	 		return this._eventController.dispatchEvent(event, arg);
	 	}


	 	private cb_parser(progress:number) {
	 		if (this._mode == 1) return;

	 		if (progress == 1) {

	 			if (this._jsonFiles.length == this._currentJSONIndex) {
		 			this._dataProgress = 0.5;
			 		this._callback(AudioCueEvents.PROGRESS, this._dataProgress + this._audioLoaderProgress);
	 				// we're ready to start
					var events:AQEvent[] = this._parser.getEvents();
					for (var i:number = 0; i<events.length; i++) {
						//console.log(events[i].actionsAndArgs);
						this._eventController.addEvent(events[i]);
					}
					this._audioLoader = new AudioLoader(this.cb_audioloader);
					this._audioLoader.addFiles(this._parser.getSoundsVO());
					this._audioLoader.preloadAll();
	 			} else {
	 				this._dataProgress = (this._currentJSONIndex / this._jsonFiles.length) * 0.5;
			 		this._callback(AudioCueEvents.PROGRESS, this._dataProgress + this._audioLoaderProgress);

			 		this._parser.parseUrl(this._jsonFiles[this._currentJSONIndex]);
			 		this._currentJSONIndex++;

	 			}
	 		}
	 	}

	 	private cb_audioloader(af:AudioSource, itemsLeft:number) {
	 		var totalItems:number = this._parser.getNumberOfSounds();
	 		var progress:number = 1-(itemsLeft/totalItems);
	 		this._audioLoaderProgress = progress*0.5;
	 		this._callback(AudioCueEvents.PROGRESS, this._dataProgress + this._audioLoaderProgress);
//	 		console.log("Audioloader progress: "+progress + " "+totalItems+ " "+itemsLeft);

			if (itemsLeft == 0) {
				//console.log(btbloader);
				var allBuffers:AudioSource[] = this._audioLoader.getAudioSourcesMap();
				//console.log(allBuffers);
				// i sequences finns soundsVO och audiofilesVO
				var sequencesVO:AudioCue.SequenceVO[] = this._parser.getSequencesVO();
				for (var prop in sequencesVO) {
					var sevo:AudioCue.SequenceVO = sequencesVO[prop];
					//console.log("wtf: "+sevo);
					sevo.audioSources = new Array();
					for (var j:number = 0; j<sevo.soundsVO.length; j++) {
						var sovo:SoundVO = sevo.soundsVO[j];
						sevo.audioSources.push(allBuffers[sovo.name]);
						//console.log("create: "+sovo.name);
					}
				}

				var soundObjectsVO:AudioCue.SoundObjectVO[] = this._parser.getSoundObjectsVO();
				for (var prop in soundObjectsVO) {
					var sobvo:AudioCue.SoundObjectVO = soundObjectsVO[prop];
					sobvo.audioSources = new Array();
					for (var j:number = 0; j<sevo.soundsVO.length; j++) {
						var sovo:AudioCue.SoundVO = sobvo.soundsVO[j];
						sobvo.audioSources.push(allBuffers[sovo.name]);
					}
					new SoundObject(sobvo, null);



				}

				
				var arrsVO:AudioCue.ArrangementVO[] = this._parser.getArrangementsVO();
				for (var prop in arrsVO) { this._arrangementController.createArrangement(arrsVO[prop]); }
				
				this._ready = true;
				this._callback(AudioCueEvents.READY, 0);

			}
		}
	}
	export class AudioCueEvents {
		static READY:string = "aqready";
		static PROGRESS:string = "aqprogress";
	}

	export interface AudioCueCallback {
		(event:string, val:any):void;
	}
}