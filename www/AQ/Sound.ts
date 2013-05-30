///<reference path='../typings/waa-nightly.d.ts' />
///<reference path='AQInterfaces.d.ts' />
///<reference path='AQStructs.ts' />
///<reference path='AudioLoader.ts' />
///<reference path='Group.ts' />
///<reference path='SoundController.ts' />
///<reference path='AQObject.ts' />
///<reference path='PoolController.ts' />


module AudioCue {

 	export class Sound extends AQObject implements ISound {
 		private _audioFile:AudioSource;
 		private _playingSounds:PlayingSound[];
 		private _idCount:number = 0;
 		private _callback:SoundCallback;



 		//public owner:any;
 		

 		// provided by a sequence / sound object object??
 		private _ac:webkitAudioContext;

		constructor(audioFile:AudioSource, context:webkitAudioContext, callback:SoundCallback) {
			super();
			this._audioFile = audioFile;
			this._callback = callback;
			//this._ac = new webkitAudioContext();
			this._ac = context;
			


			//this._playingSounds = new Array();
		}
		public getDuration():number {
			return this._audioFile.buffer.duration;
		}

		public getMusicalLength():number {
			return this._audioFile.soundVO.musicalLength;
		}

		public getContext():webkitAudioContext { return this._ac; }

		public play(time:number, group?:Group = null):PlayingSound {
			//var ac:webkitAudioContext = new webkitAudioContext();
			var source:AudioSourceNode = this._ac.createBufferSource();
			source.buffer = this._audioFile.buffer;

			if (group) {
				source.connect(group.getNode());
			} else {
				source.connect(this._ac.destination);
			}
			
			source.noteOn(this._ac.currentTime+time);

			var p:PlayingSound = PoolController.getObject(PlayingSound);

			//var p:PlayingSound = new PlayingSound;
			p.id = this._idCount++;
			p.source = source;
			p.isPlaying = true;
			p.startTime = this._ac.currentTime+time;
			p.parent = this;
			p.startListening(this.cb_soundCallback);

			//this._playingSounds.push(p);


			return p;
		}

		private cb_soundCallback(event:string, p:PlayingSound, arg:number):void {
			var self:ISound = p.parent;
			if (this._callback) {
				this._callback(event, p, arg);
			}

		}

		public stopPlayingSound(p:PlayingSound, time:number) {
			p.source.noteOff(0);
			p.isPlaying = false;
			SoundController.getInstance().removePlayingSound(p);

		}

 	}



}