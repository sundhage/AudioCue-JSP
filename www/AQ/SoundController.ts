/*
	SHOULD BE CONSIDERED PRIVATE IN THIS MODULE. How!?!?

	AudioCue is the master singleton later on..

*/


///<reference path='../typings/waa-nightly.d.ts' />
///<reference path='AQObject.ts' />
///<reference path='Sound.ts' />
///<reference path='Silence.ts' />
///<reference path='AudioLoader.ts' />

module AudioCue {
 	export class SoundController extends AQObject {
 		// so we have time to start off new sonds in synch. test and change later on...
 		static LOOKAHEAD:number = (1024/44100)*2;
 		//static LOOKAHEAD:number = 0.5;

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

		public static createInstance(callback:SoundCallback):SoundController {
			if (!_instance) {
				_instance = new SoundController(callback);
			}
			return _instance;
		}
	 	static getInstance():SoundController { return _instance; }

	 	private _callback:SoundCallback;
	 	private _context:webkitAudioContext;
	 	//private _masterPosition:number = 0;
		private _scriptNode:ScriptProcessorNode;

		private _playingSounds:PlayingSoundHolder[];
		private _toBeRemoved:PlayingSound[] = [];

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

	 	// not yet implemented...
	 	public stop():void {
	 		// todo: stop everything etc etc.. 
			this._scriptNode.disconnect();
	 	}

	 	// might be useless further ahead..
	 	public getOutputContext():webkitAudioContext { return this._context; }

	 	// poolify?
	 	public addPlayingSound(p:PlayingSound, callback:SoundCallback):void {
	 		// get one free from pool instead. will prevent GC working
	 		
	 		var ph:PlayingSoundHolder = new PlayingSoundHolder;
	 		ph.playingSound = p;
	 		ph.callback = callback;
	 		ph.musicalEndIsDispatched = false;
	 		ph.startIsDispatched = false;
	 		this._playingSounds.push(ph);
	 	}

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

	export class PlayingSoundHolder {
		//addedAtTime:number;
		playingSound:PlayingSound;
		callback:SoundCallback;
		musicalEndIsDispatched:bool;
		startIsDispatched:bool;
	}
}