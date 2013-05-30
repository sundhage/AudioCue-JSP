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