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
///<reference path='AQObject.ts' />
///<reference path='Sound.ts' />
///<reference path='Silence.ts' />
///<reference path='AudioLoader.ts' />

module AudioCue {
	/**
		Singleton class. Handles all created sounds and controls timings of musical end and actual end of all sounds.
	*/
 	export class SoundController extends AQObject {
 		/**
			When checking for musical end we have to be a bit early in time (to have time to start other ISounds)
			This is the variable of how far ahead to check for musical ends.
 		*/
 		static LOOKAHEAD:number = (1024/44100)*2;
 		/**
			This is the ISound factory method.
			@param audioSource the AudioSource instance
			@param ctx The global audio context.
			@param callback the SoundCallback instance
 		*/
 		public static createSound(audioSource:AudioSource, ctx:webkitAudioContext, callback:SoundCallback):ISound {
 			var snd:ISound = null;
 			var vo:SoundVO = audioSource.soundVO;
 			if (vo.type == SoundVO.SOUND_TYPE_AUDIOFILE) {
 				snd = new Sound(audioSource, ctx, callback);
 			} else if (vo.type == SoundVO.SOUND_TYPE_SILENCE) {
 				snd = new Silence(audioSource, ctx, callback);
 			}
 			return snd;

 		}

		private static _instance:SoundController = null;
		/**
			Creates the singleton instance
			@param callback not currently used
		*/
		public static createInstance(callback:SoundCallback):SoundController {
			if (!_instance) {
				_instance = new SoundController(callback);
			}
			return _instance;
		}
		/**
			returns the singleton instance.
		*/
	 	static getInstance():SoundController { return _instance; }

	 	private _callback:SoundCallback;
	 	private _context:webkitAudioContext;
	 	//private _masterPosition:number = 0;
		private _scriptNode:ScriptProcessorNode;

		private _playingSounds:PlayingSoundHolder[];
		private _toBeRemoved:PlayingSound[] = [];
		/**
			private constructor. @see SoundController.createInstance()
		*/
	 	constructor(callback:SoundCallback) {
	 		super();
	 		this._callback = callback;
	 		this._context = new webkitAudioContext();
	 		this._playingSounds = new Array();
	 	}

	 	public getMasterContext():webkitAudioContext {
	 		return this._context;
	 	}

	 	// OBS! Use sounds' contexts timelines and times.. Do NOT mess with 
	 	// own master position and stuff -> uneccesary 


	 	// this might be the most reliable timer with enough priority...
	 	// used only for dispatching events on cues and endings.
	 	// might be better to use the sounds actual internal position and just measure?

	 	private cb_processAudio(e:AudioProcessingEvent):void {
	 		this._toBeRemoved.length = 0;


	 		for (var i:number = 0; i<this._playingSounds.length; i++) {
	 			var p:PlayingSoundHolder = this._playingSounds[i];
	 			var sound:ISound = p.playingSound.parent;
	 			var ctx:webkitAudioContext = sound.getContext();
	 			var endPos:number = p.playingSound.startTime + p.playingSound.parent.getDuration();
	 			var mxEndPos:number = p.playingSound.startTime + p.playingSound.parent.getMusicalLength() - SoundController.LOOKAHEAD;
	 			var currentPos:number = ctx.currentTime;
	 			if (currentPos >= endPos) {
	 				this._toBeRemoved.push(p.playingSound);

	 			}
	 			if (currentPos >= mxEndPos && p.musicalEndIsDispatched == false) {
	 				p.musicalEndIsDispatched = true;
	 				p.callback(SoundEvents.SOUND_MUSICAL_END, p.playingSound, 0);

	 			}
	 			if (currentPos >= p.playingSound.startTime && p.startIsDispatched == false) {
	 				p.startIsDispatched = true;
	 				p.callback(SoundEvents.SOUND_START, p.playingSound, 0);
	 			}

	 		}

	 		if (this._toBeRemoved.length > 0) this._removePlayingSounds(this._toBeRemoved, true);
	 	}

	 	/**
			Starts all the timing system stuff. Must be run before playing any sounds.
	 	*/
	 	public start():void {
	 		try {

	 			// chrome factory
	 			this._scriptNode = this._context.createScriptProcessor(1024,1,1);
	 		} catch (e) {

	 			// safari factory
	 			this._scriptNode = this._context.createJavaScriptNode(1024,1,1);

	 		}
	 		this._scriptNode.onaudioprocess = this.cb_processAudio;

	 		this._scriptNode.connect(this._context.destination);

	 	}
	 	/**
	 		not yet properly implemented...
	 	*/
	 	public stop():void {
	 		// todo: stop everything etc etc.. 
			this._scriptNode.disconnect();
	 	}

	 	/**
			Returns the global context.
	 	*/
	 	public getOutputContext():webkitAudioContext { return this._context; }

	 	/**
			add a playing sound so this controller can callback musical end and actual end.
			TODO: Poolify PlayingSoundHolder
			@param p playingSound instance
			@param callback the SoundCallback function
	 	*/
	 	public addPlayingSound(p:PlayingSound, callback:SoundCallback):void {
	 		// get one free from pool instead. will prevent GC working
	 		
	 		var ph:PlayingSoundHolder = new PlayingSoundHolder;
	 		ph.playingSound = p;
	 		ph.callback = callback;
	 		ph.musicalEndIsDispatched = false;
	 		ph.startIsDispatched = false;
	 		this._playingSounds.push(ph);
	 	}
	 	/**
			removes a playing sound from the list of sounds that are checked if they're playing
	 	*/
	 	public removePlayingSound(p:PlayingSound):void {
	 		this._toBeRemoved.length = 0;
	 		this._toBeRemoved.push(p);
	 		this._removePlayingSounds(this._toBeRemoved, false);
	 	}

	 	private _removePlayingSounds(p:PlayingSound[], dispatch:bool):void {
	 		//var self:SoundController = SoundController.getInstance();
	 		for (var j:number = 0; j<p.length; j++) {
	 			for (var i:number = 0; i<this._playingSounds.length; i++) {
	 				if (p[j] == this._playingSounds[i].playingSound) {
	 					if (dispatch)
		 					this._playingSounds[i].callback(SoundEvents.SOUND_END, this._playingSounds[i].playingSound, 0);

		 				PoolController.freeObject(PlayingSound, this._playingSounds[i].playingSound);
	 					this._playingSounds.splice(i, 1);
	 					break;
	 				}
	 			}
	 		}
	 	}
	}
	/**
		A holder of playing sounds with some additional meta data	
		TODO: extend with Poolable
	*/
	export class PlayingSoundHolder {
		/**
			the PlayingSound instance
		*/
		playingSound:PlayingSound;
		/**
			the callback
		*/
		callback:SoundCallback;
		/**
			flag that indicates if musical end is callbacked / dispatched
		*/
		musicalEndIsDispatched:bool;
		/**
			flag that indicates is sound start is callbacked / dispatched
		*/
		startIsDispatched:bool;
	}
}