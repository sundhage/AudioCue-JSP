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
///<reference path='AQObject.ts' />
///<reference path='Arrangement.ts' />
module AudioCue {

	// add arrangement (arrvo)
	// play arrangement (arr, cue?, returnCueStart:bool?true):time to start, time to cue start
	// stop arrangement (hard)
	// stop domain:time to stop

	/**
		Singleton class that handles Arrangement instances and their domains.

	*/
 	export class ArrangementController extends AQObject {

		private static _instance:ArrangementController = null;
		/**
			Creates the instance and returns it. If the instance allready exist it will return it without creating a new one.
			@callback Callback, not implemented yet.
		*/
		public static createInstance(callback:ArrangementControllerCallback):ArrangementController {
			if (!_instance) {
				_instance = new ArrangementController(callback);
			}
			return _instance;
		}
		/**
			Returns the singleton instance.
		*/
	 	static getInstance():ArrangementController { return _instance; }

	 	private _callback:ArrangementControllerCallback;

	 	private _domains:Domain[];

	 	// same as in _domains
	 	private _allArrangements:Arrangement[];


	 	/**
			ArrangementController should be created using ArrangementController.createInstance()
	 	*/
	 	constructor(callback:ArrangementControllerCallback) {
	 		super();
	 		this._domains = new Array();
	 		this._allArrangements = new Array();
	 		this._callback = callback;
	 	}
	 	/**
			creates a new Arrangement instance and returns it.
			@arrVO the arrangement settings.
	 	*/
	 	public createArrangement(arrVO:ArrangementVO):Arrangement {
	 		var arr:Arrangement = new Arrangement(arrVO, this.cb_arrangementCallback);

	 		var arrName:string = arr.getTitle();
	 		this._allArrangements[arrName] = arr;


	 		var ds:string = arr.getDomain();
	 		if (this._domains[ds]) {
	 			this._domains[ds].arrangements[arrName] = arr;
	 		} else {
	 			var d:Domain = new Domain();
	 			d.title = ds;
	 			d.arrangements = new Array();
	 			d.arrangements[arrName] = arr;
	 			this._domains[ds] = d;
	 		}
	 		return arr;
	 	}
	 	/**
			Plays an arrangement (and optionally a cued arrangement) and returns a time value of when it will be played.
			If another arrangement is playing in the same domain it will get stopped and the arrangement to be played will play
			when the other arrangement reaches its musical end.
			@param name Name of the arrangement to play
			@param cue Name of the cued arrangement to play
			@param returnCueStart if true this method will return the time when the cue will start playing. otherwise when the first arrangement will start playing
	 	*/
	 	public playArrangement(name:string, cue?:string = null, returnCueStart?:bool = false):number {
	 		var arr:Arrangement = this._allArrangements[name];
	 		if (!arr) return 0;
	 		
	 		var cuedArr:Arrangement = null;
	 		if (cue)
		 		cuedArr = this._allArrangements[cue];

	 		var ds:string = arr.getDomain();
	 		var domain:Domain = this._domains[ds];
	 		//console.log(this._domains);

	 		if (domain.currentArrangement == arr) return 0;
	 		domain.cuedArrangement = cuedArr;
	 		//if (domain.cuedArrangement) domain.cuedArrangement = null;
	 		var time:number = 0;
	 		var retTime:number = 0;
	 		if (domain.currentArrangement) {
	 			//console.log(domain.title + " " + domain.currentArrangement);
	 			retTime = time = domain.currentArrangement.stop(false);
	 		}

	 		if (returnCueStart) {
	 			retTime += arr.getTotalTime();
	 		}
	 		domain.currentArrangement = arr;
	 		//console.log(time);
	 		arr.play(time);
	 		//console.log("next start "+time+ " ret time: " + retTime);
	 		return retTime;
	 	}
	 	/**
			Returns the Arrangement instance
			@param name Arrangement name
	 	*/
	 	public getArrangement(name:string):Arrangement {
	 		return this._allArrangements[name];
	 	}
	 	/**
			Returns the current arrangement playing in a specified domain. If no arrangement is playing it'll return null.
			@param domainName Name of the domain.
	 	*/
	 	public getCurrentArrangementInDomain(domainName:string):Arrangement {
	 		return this._domains[domainName].currentArrangement;
	 	}

	 	/**
			Stops the current arrangement playing in a domain.
			@param hard If set to true, the arrangement will stop immediately. If set to false the arrangement will keep playing current playing sounds, but not continue to play any following sounds.
	 	*/
	 	public stopDomain(domainName:string, hard:bool):number {
	 		var res:number = 0;
	 		if (this._domains[domainName].currentArrangement) {
	 			// stoppar man när hard är false flera gånger måste man alltid få rätt tid tillbaka.
	 			// Sequence och Arrangement bör alltså hålla en isabouttostop-flagga.. pyssel men borde inte va några problem.
	 			res = this._domains[domainName].currentArrangement.stop(hard);
	 		}

	 		this._domains[domainName].cuedArrangement = null;
	 		// should be set in callback
	 		this._domains[domainName].currentArrangement = null;
	 		return res;
	 	}

	 	private cb_arrangementCallback(event:string, sender:Arrangement, val:number) {
	 		var sdomain:string = sender.getDomain();
	 		var domain:Domain = this._domains[sdomain];

	 		if (domain.cuedArrangement) {
	 			var time:number = sender.stop(false);
	 			domain.cuedArrangement.play(time);
	 			domain.currentArrangement = domain.cuedArrangement;
	 			domain.cuedArrangement = null;
	 		}
	 	}


	}
	/**
		Not used / implemented.
	*/
	export interface ArrangementControllerCallback {
		(fixme:any):any;
	}
	/**
		A representation of a Domain.
	*/
	export class Domain {
		/**
			Domain name
		*/
		public title:string;
		/**
			Current playing arrangement (is null if no arrangement is playing)
		*/
		public currentArrangement:Arrangement;
		/**
			Cued arrangement (or null)
		*/
		public cuedArrangement:Arrangement;
		/**
			A hashmap (Object) of all arrangements in this domain. The keys are each arrangements name.
		*/
		public arrangements:Arrangement[];
	}

}