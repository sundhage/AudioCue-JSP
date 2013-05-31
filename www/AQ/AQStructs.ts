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
	/**
		A prepresentation of a playing sound, should only be created by ISound using PoolController.
		Since these objects are created and removed very often the instances are provided by an object pool (to prevent garbage collection)
		@see PoolController
	*/
 	export class PlayingSound extends Poolable {
 		/**
			unique identifier
 		*/
 		id:number;
 		/**
			the Web Audio API source node
 		*/
 		source:AudioSourceNode;
 		/**
			the start time relative to the global context created in SoundController (@see SoundController)
 		*/
 		startTime:number;
 		/**
			playing state
 		*/
 		isPlaying:bool;
 		/**
			the creator object
 		*/
 		parent:ISound;
 		/**
			Adds the sound to a listener mechanism that will fire an event when it is finished playing (since this is not supported natively in the Web Audio API)
 		*/
 		public startListening(callback) {
 			// todo:
 			SoundController.getInstance().addPlayingSound(this, callback);
 		}
 	}

 	/**
		Callback type when something happens to a PlayingSound instance (sound start, sound end, musicalEnd)
 	*/
 	export interface SoundCallback {
 		/**
			@param event Event name (@see SoundEvents)
			@param p PlayingSound instance
			@param arg Content depends on event (@see SoundEvents)
 		*/
 		(event:String, p:PlayingSound, arg:number):void;
 	}

	/**
		A value object created in AudioLoader.
	*/
 	export class AudioSource {
 		/**
			The audio data buffer.
 		*/
 		buffer:AudioBuffer;
 		/**
			Indicates if the buffer is filled
 		*/
 		isValid:bool;
 		/**
			Reference to the SoundVO instance.
 		*/
 		soundVO:SoundVO;
 	}

 	/**
		A value object containing sound settings. (created in Parser and held by ISound instances)
 	*/
 	export class SoundVO {
 		/**
			This type is means the ISound should be a Sound instance.
 		*/
 		static SOUND_TYPE_AUDIOFILE:number = 0;
 		/**
			This type is means the ISound should be a Silence instance.
 		*/
 		static SOUND_TYPE_SILENCE:number = 1;

 		/**
			Name of the sound.
 		*/
 		name:string;
 		/**
			Sound path
 		*/
 		path:string;
 		/**
			Sound type. @see SOUND_TYPE_AUDIOFILE @see SOUND_TYPE_SILENCE
 		*/
 		type:number;
 		/**
			Sound musical length in seconds.
 		*/
 		musicalLength:number;
 	}
 	

 	/**
		A value object containing SoundObject settings. (created in Parser)
 	*/
	export class SoundObjectVO {
		/**
			An indexed array of AudioSource instances
		*/
		public audioSources:AudioSource[];
		/**
			Sound Object name
		*/
		public title:string;
		/**
			An indexed array of SoundVO instances
		*/
		public soundsVO:SoundVO[];
		/**
			Type of SoundObject
			@see SoundObjectTypes
		*/
		public type:number;
		/**
			Name of group all sounds should be played through.
		*/
		public groupName:string;
	}

 	/**
		A value object containing Sequence settings. (created in Parser)
 	*/
 	export class SequenceVO {
		/**
			An indexed array of AudioSource instances
		*/
 		public audioSources:AudioSource[];
		/**
			An indexed array of SoundVO instances
		*/
 		public soundsVO:SoundVO[];
 		/**
			Indicated whether the sequence should loop or not.
 		*/
 		public loop:bool;
		/**
			Sequence name
		*/
 		public title:string;
		/**
			Name of group all sounds should be played through.
		*/
 		public groupName:string;
 	}

 	/**
		A value object containing Arrangement settings. (created in Parser)
 	*/
 	export class ArrangementVO {
 		/**
			An indexed array of SequenceVO instances
 		*/
		public sequencesVO:SequenceVO[];
		/**
			Arrangement title
		*/
		public title:string;
		/**
			The arrangements domain (top level in musical hierarchy)
		*/
		public domain:string;
 	}

	/**
		A holder of static strings which contain valid event names in a PlayingSound callback.
	*/
 	export class SoundEvents {
 		/**
			Notifies that a sound has reached its end position. The callback argument arg (@see SoundCallback) will be 0
 		*/
 		static SOUND_END:string = "soundend";
 		/**
			Notifies that a sound is about to reach its musical end position. The callback argument arg (@see SoundCallback) will contain the (relative) time to when the musical end will happen.
 		*/
 		static SOUND_MUSICAL_END:string = "soundmusicalend";
 		/**
			Notifies that a sound started (if it was set to start in the future). The callback argument arg (@see SoundCallback) will be 0
 		*/
 		static SOUND_START:string = "soundstart";
 	}


}