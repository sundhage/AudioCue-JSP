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
/*
	Todo: callbacking on end etc..
	

	Have to be able to cue stuff..

	Base class (for effects/tweens etc)
	Also: Effect chain and all that (should be made on this level? at least some efx)

	Bus-system w/ gain?
	Group-system

*/

///<reference path='AQObject.ts' />
///<reference path='AQStructs.ts' />

///<reference path='AudioLoader.ts' />
///<reference path='Group.ts' />
///<reference path='Sound.ts' />
///<reference path='SoundController.ts' />

module AudioCue {
 	export class Sequence extends AQObject {

 		private _context:webkitAudioContext;
 		private _sounds:ISound[];
 		private _audioSources:AudioSource[];
 		private _currentIndex:number = 0;
 		private _loop:bool;
 		private _playing:bool;
 		private _callback:SequenceCallback;
 		private _title:string;
 		private _group:Group;


 		private _playingSounds:PlayingSound[];


 		private _currentPlayingSound:PlayingSound;



 		constructor(sequenceVO:SequenceVO, callback:SequenceCallback) {
 			super();
 			this._loop = sequenceVO.loop;
 			this._sounds = new Array();
 			this._audioSources = sequenceVO.audioSources;
 			//this._context = new webkitAudioContext();
 			this._context = SoundController.getInstance().getMasterContext();
 			this._playing = false;
			this._playingSounds = new Array();
			this._callback = callback;
			this._title = sequenceVO.title;
			this._group = Group.getGroup(sequenceVO.groupName);



 			for (var i:number = 0; i<this._audioSources.length; i++) {
 				var af:AudioSource = this._audioSources[i];
// 				var sound:Sound = new Sound(af, this._context, this.cb_soundCallback);
				var sound:ISound = SoundController.createSound(af, this._context, this.cb_soundCallback);


 				//sound.owner = this;
 				this._sounds.push(sound);
 			}

 			// create and prepare sounds based on this._audioFiles order and such

 		}

 		public getLength():number {
 			var res:number = 0;
 			for (var i:number = 0; i<this._sounds.length; i++) {
 				var sound:ISound = this._sounds[i];
 				res += sound.getMusicalLength();
 			}

 			return res;
 		}

 		// start from a specific index at a time offset
 		public play(index:number, offset:number):void {
 			if (this._playing) return;
 			index = index % this._sounds.length;
 			this._playing = true;
 			this._currentIndex = index;
 			this._play(offset);

 		}
 		// should be called from callbacks etc...
 		private _play(offset:number) {
 			if (this._playing == false) return;
 			var sound:ISound = this._sounds[this._currentIndex];
 			this._currentPlayingSound = sound.play(offset, this._group);
 			this._playingSounds.push(this._currentPlayingSound);

 		}

 		// returns time when next mx end is
 		public stop(hard:bool):number {
 			if (this._playing == false) return 0;
 			this._playing = false;
 			if (hard == false) {
 				return this.getNextStopPosition();
 			} else {
 				for (var i:number = 0; i<this._playingSounds.length; i++) {
 					var p:PlayingSound = this._playingSounds[i];
 					//console.log(p);

 					this._playingSounds[i].parent.stopPlayingSound(this._playingSounds[i],0);
 				}
 				this._playingSounds.length = 0;
 				//this._currentPlayingSound = null;
 			}


 		}

 		// returns next stop position
 		public getNextStopPosition():number {
 			//if (this._playing == false) return 0;
 			var currentSound:ISound = this._currentPlayingSound.parent;
 			var currentTime = this._context.currentTime;
 			var diff = (currentSound.getMusicalLength()+this._currentPlayingSound.startTime)-currentTime;
 			return diff;
 		}

 		public getTitle():string {
 			return this._title;
 		}

		private _removeSound(p:PlayingSound) {
			for (var i:number = 0; i<this._playingSounds.length; i++) {
				if (this._playingSounds[i] == p) {
					this._playingSounds.splice(i, 1);
					break;
				}
			}
		}

 		// handle onMusicalEnd
 		private cb_soundCallback(event:string, playingSound:PlayingSound, value:number):void {
 			//var self:Sequence = playingSound.parent.owner;
 			//köa upp nästa ljud
 			if (event == SoundEvents.SOUND_MUSICAL_END) {
 				var offset = this.getNextStopPosition();
 				if (this._currentIndex == this._sounds.length-1) {
 					if (this._callback)
	 					this._callback(SequenceEvents.SEQUENCE_END, this, 0);
 				}
 				this._currentIndex = (this._currentIndex +1) % this._sounds.length;
 				this._play(offset);

 				//console.log("Mx end: "+self);
 			}
 			
 			if (event == SoundEvents.SOUND_END) {
 				this._removeSound(playingSound);
 			}
 			if (event == SoundEvents.SOUND_START) {
 				// handle?
 			}
 			
 		}

	}

 	export class SequenceEvents {
 		static SEQUENCE_END:string = "sequenceend";
 		static SEQUENCE_START:string = "seqstart";
 	}
 	export interface SequenceCallback {
 		(event:string, sender:Sequence, val:number):void;
 	}


}