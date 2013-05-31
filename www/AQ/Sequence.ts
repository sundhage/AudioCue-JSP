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

///<reference path='AudioLoader.ts' />
///<reference path='Group.ts' />
///<reference path='Sound.ts' />
///<reference path='SoundController.ts' />

module AudioCue {
	/**
		A Sequence represents a sequence of ISounds that play after each other. The Sequence object start its next sound exactly
		when the previous sound's musical end occur.

	*/
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


 		/**
			@param sequenceVO Sequence settings
			@param callback Callback function @see SequenceCallback
 		*/
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
				var sound:ISound = SoundController.createSound(af, this._context, this.cb_soundCallback);
 				this._sounds.push(sound);
 			}
 		}
 		/**
			Returns the total length of the sequence.
 		*/
 		public getLength():number {
 			var res:number = 0;
 			for (var i:number = 0; i<this._sounds.length; i++) {
 				var sound:ISound = this._sounds[i];
 				res += sound.getMusicalLength();
 			}
 			return res;
 		}
 		/**
			Plays the sequence at a specified time, starting from a specific sound.
			@param index Sound index (the internal array equals SequenceVO[].soundsVO)
			@param offset Time offset when to start (relative to now)
 		*/
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

 		/**
			Stops the sequence (if playing) and returns time to next stop position.
			@param hard If set to true, the sequence will stop immediately. If set to false the sequence will keep playing current playing sounds, but not continue to play any following sounds.
 		*/
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

 		/**
 			Returns time to next stop position
 		*/
 		public getNextStopPosition():number {
 			//if (this._playing == false) return 0;
 			var currentSound:ISound = this._currentPlayingSound.parent;
 			var currentTime = this._context.currentTime;
 			var diff = (currentSound.getMusicalLength()+this._currentPlayingSound.startTime)-currentTime;
 			return diff;
 		}
 		/**
			Returns the Sequence title
 		*/
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
 			if (event == SoundEvents.SOUND_MUSICAL_END) {
 				var offset = this.getNextStopPosition();
 				if (this._currentIndex == this._sounds.length-1) {
 					if (this._callback)
	 					this._callback(SequenceEvents.SEQUENCE_END, this, 0);
 				}
 				this._currentIndex = (this._currentIndex +1) % this._sounds.length;
 				this._play(offset);
 			}
 			
 			if (event == SoundEvents.SOUND_END) {
 				this._removeSound(playingSound);
 			}
 			if (event == SoundEvents.SOUND_START) {
 				// handle?
 			}
 			
 		}

	}
 	/**
		Holder of SequenceCallback event names
 	*/
 	export class SequenceEvents {
 		/**
			Will fire when the sequences last sound reaches its musical end. The val parameter will be 0
 		*/
 		static SEQUENCE_END:string = "sequenceend";
 		/**
			Will fire when the sequences starts (if played with an offset). The val parameter will be 0
 		*/
 		static SEQUENCE_START:string = "seqstart";
 	}
 	/**
		Callback type spec.
 	*/
 	export interface SequenceCallback {
 		/**
			@param event The callback event name. @see SequenceEvents
			@param sender Sequence instance
			@param val Not implemented.
 		*/
 		(event:string, sender:Sequence, val:number):void;
 	}


}