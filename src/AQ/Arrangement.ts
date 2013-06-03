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
///<reference path='AudioLoader.ts' />
///<reference path='Sequence.ts' />
///<reference path='AQObject.ts' />
///<reference path='AQStructs.ts' />
///<reference path='SoundController.ts' />

module AudioCue {
	/**
		An Arrangement holds a number of Sequence instances that gets played in parallell.
		Each arrangement belongs to a domain. Two arrangements from the same domain should not be played in the same time.
	*/

 	export class Arrangement extends AQObject {
 		private _sequencesVO:SequenceVO[];
 		private _sequences:Sequence[];

 		private _title:string;
 		private _domain:string;


 		private _playing:bool = false;
 		private _callback:ArrangementCallback;

 		private _longestSequence:Sequence;

 		/**
 			An arrangement should only be created using ArrangementController.createArrangement(...)
			@param vo The arrangement settings.
			@param callback Function that gets executed when an arrangement starts and ends.
 		*/
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
 		/**
			returns the domain name this arrangement belongs to
 		*/
 		public getDomain():string { return this._domain; }
 		/**
			returns the title
 		*/
 		public getTitle():string { return this._title; }

 		/**
			plays the arrangement
			@param offset When the arrangement should be played relative to current time.
 		*/
 		public play(offset:number):void {
 			if (this._playing) return;
 			this._playing = true;
 			for (var i:number = 0; i<this._sequences.length; i++) {
 				this._sequences[i].play(0, offset);
 			}
 		}
 		/**
			Stops the arrangement. Returns the time when the arrangement reaches next musical end (if hard is set to false, otherwise 0).
			@param hard If set to true, the arrangement will stop immediately. If set to false the arrangement will keep playing current playing sounds, but not continue to play any following sounds.
 		*/
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

 		/**
			returns the next musical end position.
 		*/
 		public getNextStopPosition():number {
 			var res:number = 0;
 			for (var i:number = 0; i<this._sequences.length; i++) {
 				var t:number = this._sequences[i].getNextStopPosition();
 				if (t>res) res = t;
 			}
 			return res;
 		}
 		/**
			returns the longest sequence's total time.
 		*/
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
 		}


 	}

 	/**
		Holder of ArrangementCallback event names
 	*/
 	export class ArrangementEvents {
 		/**
			Will fire when the longest sequence reaches its end.
			the ArrangementCallback val argument is set to 0, but should be set to a timing difference.
 		*/
 		static ARRANGEMENT_END:string = "arrend";
 		/**
			Unused, not implemented.
 		*/
 		static ARRANGEMENT_START:string = "arrstart";
 	}
 	/**
		Callback type spec.
 	*/
 	export interface ArrangementCallback {
 		/**
			@param event Event name (@see ArrangementEvents)
			@param sender The Arrangement instance that sent the event
			@param val Value depends on event. Not implemented properly yet.
 		*/
 		(event:string, sender:Arrangement, val:number):void;
 	}

}
