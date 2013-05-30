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
///<reference path='../typings/waa-nightly.d.ts' />
///<reference path='AQInterfaces.d.ts' />
///<reference path='AQStructs.ts' />
///<reference path='AudioLoader.ts' />
///<reference path='Group.ts' />
///<reference path='SoundController.ts' />
///<reference path='AQObject.ts' />
///<reference path='PoolController.ts' />


module AudioCue {

 	export class Sound extends AQObject implements ISound {
 		private _audioFile:AudioSource;
 		private _playingSounds:PlayingSound[];
 		private _idCount:number = 0;
 		private _callback:SoundCallback;



 		//public owner:any;
 		

 		// provided by a sequence / sound object object??
 		private _ac:webkitAudioContext;

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