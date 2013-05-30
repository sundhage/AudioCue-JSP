/*
Copyright (c) 2013 Johan Sundhage (Klevgränd Produktion AB)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
///<reference path='AQObject.ts' />
///<reference path='Arrangement.ts' />

module AudioCue {

 	export class EventController extends AQObject {
		private static _instance:EventController = null;

		public static createInstance():EventController {
			if (!_instance) {
				_instance = new EventController();
			}
			return _instance;
		}
	 	static getInstance():EventController { return _instance; }

	 	private _actions:IAction[];

	 	// available events (hashmap).. (of AQEvent)
	 	private _events:AQEvent[];

	 	constructor() {
	 		super();
	 		this._actions = new Array();
	 		this._events = new Array();
	 	}

	 	public addEvent(event:AQEvent):void {
	 		//console.log(event);
	 		this._events[event.name] = event;
	 	}

	 	public addAction(action:IAction, name:string):void {
	 		this._actions[name] = action;
	 	}

	 	public haveAction(actionName:string):bool {
	 		return (this._actions[actionName] != undefined);
	 	}
	 	public getEvents():AQEvent[] { return this._events; }

	 	public dispatchEvent(eventName:string, devArgs?:any = null):number {
	 		var event:AQEvent = this._events[eventName];
	 		var ret:number = 0;
	 		for (var i:number = 0; i<event.actionsAndArgs.length; i++) {

	 			var val:number = this._actions[event.actionsAndArgs[i].actionName](event.actionsAndArgs[i].args, devArgs);
	 			if (val > ret) ret = val;
	 		}
	 		return ret;
	 	}

	}

	export interface IAction {
		(args:any[], devArgs:any):number;
	}

	export class ActionAndArg {
		actionName:string;
		args:any;
	}

	export class AQEvent {
		name:string;
		// index based
		actionsAndArgs:ActionAndArg[];
	}

	// on-startup
	EventController.createInstance();

}
