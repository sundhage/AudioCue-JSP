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