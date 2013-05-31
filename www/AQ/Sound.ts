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
///<reference path='AQInterfaces.d.ts' />
///<reference path='AQStructs.ts' />
///<reference path='AudioLoader.ts' />
///<reference path='Group.ts' />
///<reference path='SoundController.ts' />
///<reference path='AQObject.ts' />
///<reference path='PoolController.ts' />


module AudioCue {
	/**
		A sound that plays a buffer of audio data.
		@see ISound
	*/

 	export class Sound extends AQObject implements ISound {
 		private _audioFile:AudioSource;
 		private _playingSounds:PlayingSound[];
 		private _idCount:number = 0;
 		private _callback:SoundCallback;



 		private _ac:webkitAudioContext;
 		/**
			@see SoundController.createSound(...)			
 		*/
		constructor(audioFile:AudioSource, context:webkitAudioContext, callback:SoundCallback) {
			super();
			this._audioFile = audioFile;
			this._callback = callback;
			//this._ac = new webkitAudioContext();
			this._ac = context;
			


			//this._playingSounds = new Array();
		}
		public getDuration():number {
			return this._audioFile.buffer.duration;
		}

		public getMusicalLength():number {
			return this._audioFile.soundVO.musicalLength;
		}

		public getContext():webkitAudioContext { return this._ac; }

		public play(time:number, group?:Group = null):PlayingSound {
			//var ac:webkitAudioContext = new webkitAudioContext();
			var source:AudioSourceNode = this._ac.createBufferSource();
			source.buffer = this._audioFile.buffer;

			if (group) {
				source.connect(group.getNode());
			} else {
				source.connect(this._ac.destination);
			}
			
			source.noteOn(this._ac.currentTime+time);

			var p:PlayingSound = PoolController.getObject(PlayingSound);

			//var p:PlayingSound = new PlayingSound;
			p.id = this._idCount++;
			p.source = source;
			p.isPlaying = true;
			p.startTime = this._ac.currentTime+time;
			p.parent = this;
			p.startListening(this.cb_soundCallback);

			//this._playingSounds.push(p);


			return p;
		}

		private cb_soundCallback(event:string, p:PlayingSound, arg:number):void {
			var self:ISound = p.parent;
			if (this._callback) {
				this._callback(event, p, arg);
			}

		}

		public stopPlayingSound(p:PlayingSound, time:number) {
			p.source.noteOff(0);
			p.isPlaying = false;
			SoundController.getInstance().removePlayingSound(p);

		}

 	}



}