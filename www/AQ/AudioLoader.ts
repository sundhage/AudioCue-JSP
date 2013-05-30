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
///<reference path='../typings/waa-nightly.d.ts' />
///<reference path='AQObject.ts' />
///<reference path='AQStructs.ts' />
///<reference path='Sound.ts' />



 module AudioCue {

	declare var Base64Binary;

 	export class AudioLoader extends AQObject {
		private _loadCue:AudioSource[];
	 	private _loadedData:AudioSource[];
	 	private _loadedDataMap:AudioSource[];

	 	private _isPreloading:bool;
	 	private _callback:AudioSourceCallback;
	 	private _context:webkitAudioContext;

	 	private _audioFileJSON:any;



 		constructor(callback:AudioSourceCallback) {
 			super();
 			this._callback = callback;
 			this._loadCue = new Array();
 			this._loadedData = new Array();
 			this._loadedDataMap = new Array();
 			this._isPreloading = false;
 			this._context = new webkitAudioContext();
 		}

 		addFile(soundVO:SoundVO) {
 			// dont wanna create condition races...
 			if (this._isPreloading) return;

 			var af:AudioSource = new AudioSource();
 			af.soundVO = soundVO;
 			this._loadCue.push(af);

 		}

 		addFiles(soundsVO:SoundVO[]) {
 			if (this._isPreloading == true) return;
 			// console.log("mm");
 			//console.log("wtf -> " +  soundsVO + "humm");

 			for (var prop in soundsVO) {
 				//console.log("adding "+soundsVO[prop].name);
 				this.addFile(soundsVO[prop]);
 			}
 		}

 		preloadAll(jsonAudioData?:any = null):bool {
 			if (this._loadCue.length == 0) return false;
 			this._isPreloading = true;
 			if (jsonAudioData) {
 				this._audioFileJSON = jsonAudioData;
 				this._preloadFromBase64();
 			} else {
 				this._preload();
 			}
 			return true;
 		}

 		private _preloadFromBase64() {
 			var af:AudioSource = this._loadCue[0];
 			var self:AudioLoader = this;
 			//af.context = new webkitAudioContext();
 			this._loadedData.push(af);
 			this._loadCue.shift();

 			 if (af.soundVO.type != SoundVO.SOUND_TYPE_AUDIOFILE) {
 				this.cb_dataDecoded(null);
 				return;
 			}

			var mp3:ArrayBuffer = Base64Binary.decodeArrayBuffer(this._audioFileJSON["files"][af.soundVO.path]);

			this._context.decodeAudioData(mp3, this.cb_dataDecoded, this.cb_onDecodeError);

 		}

 		private cb_dataDecoded(buffer:AudioBuffer) {
 			var af:AudioSource;
 			af = this._loadedData[this._loadedData.length-1];
 			af.buffer = buffer;
 			af.isValid = true;
 			this._loadedDataMap[af.soundVO.name] = af;
 			
 			this._callback(af, this._loadCue.length);
 			if (this._loadCue.length > 0) this._preloadFromBase64();
 		}

 		private _preload() {
 			var af:AudioSource = this._loadCue[0];
 			var self:AudioLoader = this;

 			//af.context = new webkitAudioContext();
 			this._loadedData.push(af);
 			this._loadCue.shift();
 			// silence...
 			if (af.soundVO.type != SoundVO.SOUND_TYPE_AUDIOFILE) {
 				this.cb_dataLoadedAndDecoded(null);
 				return;
 			}
 			//console.log(this._loadCue.length);

			var req:XMLHttpRequest = new XMLHttpRequest();

			req.open("GET", af.soundVO.path, true);
			req.responseType = "arraybuffer";
			req.onload = function() {
				self._context.decodeAudioData(req.response, self.cb_dataLoadedAndDecoded, self.cb_onDecodeError);
			}

			req.onreadystatechange = function (oEvent) {
				// errorhantera requestet här
			}

			req.send();

 		}
 		private cb_onDecodeError() {
 			console.log("File could not be decoded...");
 			// todo: handle

 		}
 		private cb_dataLoadedAndDecoded(buffer:AudioBuffer) {
 			var af:AudioSource;
 			af = this._loadedData[this._loadedData.length-1];
 			af.buffer = buffer;
 			af.isValid = true;
 			this._loadedDataMap[af.soundVO.name] = af;
 			
 			this._callback(af, this._loadCue.length);
 			if (this._loadCue.length > 0) this._preload();
 		}

 		public getAudioSourcesMap():AudioSource[] {
 			return this._loadedDataMap;
 		}

 	}


 	export interface AudioSourceCallback {
 		(af:AudioSource, cueLength:number):void;
 	}
 }