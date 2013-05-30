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
