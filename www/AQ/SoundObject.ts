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
///<reference path='Sound.ts' />
///<reference path='Group.ts' />
///<reference path='AQStructs.ts' />
///<reference path='SoundController.ts' />

module AudioCue {

	/**
		A SoundObject is a container of one of more ISound instances.
		These sounds can be started in two different ways: step by step or in random @see SoundObjectTypes
	*/

 	export class SoundObject extends AQObject {
 		/**
			returns a SoundObject instance
			@param title SoundObject name
 		*/
 		public static getSoundObject(title:string):SoundObject {
 			return SoundObject._allSoundObjects[title];
 		}

 		private static _allSoundObjects:SoundObject[] = new Array();

 		private _vo:SoundObjectVO;
 		private _callback:any;
 		private _sounds:ISound[];
 		private _audioSources:AudioSource[];
 		private _context:webkitAudioContext;
 		private _lastPlayedIndex:number = -1;
 		private _playingSounds:PlayingSound[];
 		private _group:Group;


 		/**
			@param vo SoundObject settings
			@param callback Not used.
 		*/
 		constructor(vo:SoundObjectVO, callback:any) {
 			super();
 			this._vo = vo;
 			this._callback = callback;
 			this._context = SoundController.getInstance().getMasterContext();

 			this._audioSources = vo.audioSources;
 			this._group = Group.getGroup(vo.groupName);

 			this._playingSounds = new Array();

 			this._sounds = new Array();

 			for (var i:number = 0; i<this._audioSources.length; i++) {
 				var af:AudioSource = this._audioSources[i];
// 				var sound:Sound = new Sound(af, this._context, this.cb_soundCallback);
				var sound:ISound = SoundController.createSound(af, this._context, this.cb_soundCallback);
 				//sound.owner = this;
 				this._sounds.push(sound);
 			}
			SoundObject._allSoundObjects[this._vo.title] = this;
 		}
 		/**
			Starts one of the sounds emmediately (which one is depending on the instance's type @see SoundObjectTypes)
 		*/
 		public play():void {

 			var index:number = 0;
 			if (this._sounds.length > 1) {

 			
	 			if (this._vo.type == SoundObjectTypes.RANDOMTRIG) {
	 				index = this._lastPlayedIndex;
	 				while (index == this._lastPlayedIndex) {
	 					index = Math.ceil(Math.random()*this._sounds.length);
	 				}

	 			} else if (this._vo.type == SoundObjectTypes.STEPTRIG) {
	 				index = (this._lastPlayedIndex+1)%(this._sounds.length-1);
	 			}
	 		}
 			this._playingSounds.push(this._sounds[index].play(0, this._group));
 			this._lastPlayedIndex = index;

 		}
 		/**
			Stops all current playing sounds started from this instance.
 		*/
 		public stop():void {
			for (var i:number = 0; i<this._playingSounds.length; i++) {
				var p:PlayingSound = this._playingSounds[i];

				this._playingSounds[i].parent.stopPlayingSound(this._playingSounds[i],0);
			}
			this._playingSounds.length = 0;

 		}

 		private cb_soundCallback(event:string, playingSound:PlayingSound, value:number):void {
 			if (event == SoundEvents.SOUND_END) {
 				this._removeSound(playingSound);
 			}

 		}

		private _removeSound(p:PlayingSound) {
			for (var i:number = 0; i<this._playingSounds.length; i++) {
				if (this._playingSounds[i] == p) {
					this._playingSounds.splice(i, 1);
					break;
				}
			}
		}

	}
	/**
		Holder of different sound object type definitions.
	*/
	export class SoundObjectTypes {
		/**
			SoundObjects with RANDOMTRIG type will start a random sound from the sound list.
		*/
		static RANDOMTRIG:number = 0;
		/**
			SoundObjects with STEPTRIG type will iterate through the sound list for each play (and start over from the beginning when last sound has been played)
		*/
		static STEPTRIG:number = 1;
	}

}