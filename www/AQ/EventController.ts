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
	/**
		Singleton class which handles Events and Actions.
	*/
 	export class EventController extends AQObject {
		private static _instance:EventController = null;
		/**
			Creates (and returns) the instance.
		*/
		public static createInstance():EventController {
			if (!_instance) {
				_instance = new EventController();
			}
			return _instance;
		}
		/**
			Returns the instance
		*/
	 	static getInstance():EventController { return _instance; }

	 	private _actions:IAction[];

	 	// available events (hashmap).. (of AQEvent)
	 	private _events:AQEvent[];
	 	/**
			Do create instances of EventController with new -> use EventController.createInstance()
	 	*/
	 	constructor() {
	 		super();
	 		this._actions = new Array();
	 		this._events = new Array();
	 	}
	 	/**
			Adds an event to the system. 
	 	*/
	 	public addEvent(event:AQEvent):void {
	 		//console.log(event);
	 		this._events[event.name] = event;
	 	}

	 	/**
			adds an action to the system (look in BasicActions.ts)
	 	*/
	 	public addAction(action:IAction, name:string):void {
	 		this._actions[name] = action;
	 	}
	 	/**
	 		@param actionName The name of the action.
			returns true if an action exist.
	 	*/
	 	public haveAction(actionName:string):bool {
	 		return (this._actions[actionName] != undefined);
	 	}
	 	/**
			returns a hashmap (Object) of all events. key is the event name.
	 	*/
	 	public getEvents():AQEvent[] { return this._events; }
	 	/**
			Executes all the actions in an event. Returns the highest value returned by the actions.
			@param eventName Name of the event.
			@param devArgs Some actions accepts developer arguments, this argument will be passed to all actions.
	 	*/
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
	/**
		Action type definition. All actions should conform to this type.
	*/
	export interface IAction {
		/**
			@param args hashmap (Object) with arguments
			@param devArgs Developer argument.
		*/
		(args:any[], devArgs:any):number;
	}
	/**
		Holder of an action (name) and its arguments.
	*/
	export class ActionAndArg {
		/**
			name of the action
		*/
		actionName:string;
		/**
			the actions arguments (usually a hashmap Object)
		*/
		args:any;
	}
	
	/**
		Holder of event data.
	*/
	export class AQEvent {
		/**
			Name of the event
		*/
		name:string;
		/**
			An index based array of the actions (and their arguments)
		*/
		actionsAndArgs:ActionAndArg[];
	}

	// on-startup
	EventController.createInstance();

}
