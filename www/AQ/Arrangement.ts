///<reference path='AudioLoader.ts' />
///<reference path='Sequence.ts' />
///<reference path='AQObject.ts' />
///<reference path='AQStructs.ts' />
///<reference path='SoundController.ts' />

module AudioCue {
 	export class Arrangement extends AQObject {
 		private _sequencesVO:SequenceVO[];
 		private _sequences:Sequence[];

 		private _title:string;
 		private _domain:string;


 		private _playing:bool = false;
 		private _callback:ArrangementCallback;

 		private _longestSequence:Sequence;


 		constructor(vo:ArrangementVO, callback:ArrangementCallback) {
 			super();

 			this._callback = callback;

 			this._sequencesVO = vo.sequencesVO;
 			this._domain = vo.domain;
 			this._title = vo.title;
 			this._sequences = new Array();

 			var maxLen:number = 0;
 			var tempId:number = 0;
 			for (var i:number = 0; i<this._sequencesVO.length; i++) {
 				var svo:SequenceVO = this._sequencesVO[i];
 				var s:Sequence = new Sequence(svo, this.cb_sequenceCallback);
 				this._sequences.push(s);
 				var tlen:number = s.getLength();
 				if (tlen > maxLen) {
 					maxLen = tlen;
 					tempId = i;
 				}
 			}
 			this._longestSequence = this._sequences[tempId];

 		}

 		public getDomain():string { return this._domain; }
 		public getTitle():string { return this._title; }

 		public play(offset:number):void {
 			if (this._playing) return;
 			this._playing = true;
 			for (var i:number = 0; i<this._sequences.length; i++) {
 				this._sequences[i].play(0, offset);
 			}
 		}

 		public stop(hard:bool):number {
 			if (this._playing == false) return 0;
 			this._playing = false;
 			var res:number = 0;
 			for (var i:number = 0; i<this._sequences.length; i++) {
 				var t:number = this._sequences[i].stop(hard);
 				if (t>res) res = t;
 			}
 			return res;
 		}


 		public getNextStopPosition():number {
 			var res:number = 0;
 			for (var i:number = 0; i<this._sequences.length; i++) {
 				var t:number = this._sequences[i].getNextStopPosition();
 				if (t>res) res = t;
 			}
 			return res;
 		}

 		public getTotalTime():number {
 			var res:number = 0;
 			for (var i:number = 0; i<this._sequences.length; i++) {
 				var t:number = this._sequences[i].getLength();
 				if (t>res) res = t;
 			}
 			return res;

 		}

 		private cb_sequenceCallback(event:String, sender:Sequence, val:number) {
 			if (event == SequenceEvents.SEQUENCE_END) {
 				if (sender == this._longestSequence) {
 					this._callback(ArrangementEvents.ARRANGEMENT_END, this, 0);
 				}
 			}
 			// callbacka end of sequence...
 			// hantera endast den LÄNGSTA sequencen -> gör så vi kan cuea grejjor
 		}


 	}


 	export class ArrangementEvents {
 		static ARRANGEMENT_END:string = "arrend";
 		static ARRANGEMENT_START:string = "arrstart";
 	}

 	export interface ArrangementCallback {
 		(event:string, sender:Arrangement, val:number):void;
 	}

}
