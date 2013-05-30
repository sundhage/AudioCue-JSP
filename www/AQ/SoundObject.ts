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
///<reference path='Sound.ts' />
///<reference path='Group.ts' />
///<reference path='AQStructs.ts' />
///<reference path='SoundController.ts' />

module AudioCue {
 	export class SoundObject extends AQObject {
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

	export class SoundObjectTypes {
		static RANDOMTRIG:number = 0;
		static STEPTRIG:number = 1;
	}

}