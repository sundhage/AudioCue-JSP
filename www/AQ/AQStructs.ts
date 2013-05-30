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
///<reference path='SoundController.ts' />
///<reference path='PoolController.ts' />

///<reference path='AQInterfaces.d.ts' />


module AudioCue {
	 	// take care of timers in here.. do not mess the Sound class up...
 	export class PlayingSound extends Poolable {
 		//constructor() {console.log("i am playingsound");}
 		id:number;
 		source:AudioSourceNode;
 		startTime:number;
 		isPlaying:bool;
 		parent:ISound;
 		
 		public startListening(callback) {
 			// todo:
 			SoundController.getInstance().addPlayingSound(this, callback);
 		}
 	}
 	export interface SoundCallback {
 		(event:String, p:PlayingSound, arg:number):void;
 	}

// VO's
 	export class AudioSource {
 		buffer:AudioBuffer;
 		isValid:bool;
 		soundVO:SoundVO;
 	}

 	export class SoundVO {
 		static SOUND_TYPE_AUDIOFILE:number = 0;
 		static SOUND_TYPE_SILENCE:number = 1;

 		name:string;
 		path:string;
 		type:number;
 		musicalLength:number;
 	}
 	
	export class SoundObjectVO {
		public audioSources:AudioSource[];
		public title:string;
		public soundsVO:SoundVO[];
		public type:number;
		public groupName:string;
	}

 	export class SequenceVO {
 		public audioSources:AudioSource[];
 		public soundsVO:SoundVO[];
 		public loop:bool;
 		public title:string;
 		public groupName:string;
 	}

 	export class ArrangementVO {
		public sequencesVO:SequenceVO[];
		public title:string;
		public domain:string;
 	}
// events

 	export class SoundEvents {
 		static SOUND_END:string = "soundend";
 		static SOUND_MUSICAL_END:string = "soundmusicalend";
 		static SOUND_START:string = "soundstart";
 	}


}