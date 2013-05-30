///<reference path='AQObject.ts' />
///<reference path='Arrangement.ts' />
module AudioCue {

	// add arrangement (arrvo)
	// play arrangement (arr, cue?, returnCueStart:bool?true):time to start, time to cue start
	// stop arrangement (hard)
	// stop domain:time to stop


 	export class ArrangementController extends AQObject {
		private static _instance:ArrangementController = null;

		public static createInstance(callback:ArrangementControllerCallback):ArrangementController {
			if (!_instance) {
				_instance = new ArrangementController(callback);
			}
			return _instance;
		}
	 	static getInstance():ArrangementController { return _instance; }

	 	private _callback:ArrangementControllerCallback;

	 	private _domains:Domain[];

	 	// same as in _domains
	 	private _allArrangements:Arrangement[];



	 	constructor(callback:ArrangementControllerCallback) {
	 		super();
	 		this._domains = new Array();
	 		this._allArrangements = new Array();
	 		this._callback = callback;
	 	}

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

	 	// just nu: inget stöd för cue
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

	 	public getArrangement(name:string):Arrangement {
	 		return this._allArrangements[name];
	 	}

	 	public getCurrentArrangementInDomain(domainName:string):Arrangement {
	 		return this._domains[domainName].currentArrangement;
	 	}

	 	// OBS! Fixa stöd för cues och håll reda på om saker är cueade eller inte.
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

	export interface ArrangementControllerCallback {
		(fixme:any):any;
	}

	export class Domain {
		public title:string;
		public currentArrangement:Arrangement;
		public cuedArrangement:Arrangement;
		public arrangements:Arrangement[];
	}

}