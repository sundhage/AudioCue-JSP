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
///<reference path='../typings/waa-nightly.d.ts' />
///<reference path='AQObject.ts' />

module AudioCue {
 	export class Group extends AQObject {
 		private static allGroups:Group[] = new Array();
 		public static getGroup(name:string):Group {
 			return allGroups[name];
 		}

 		private _name:string;

 		// list
 		private _effects:Effect[] = new Array();

 		private _gain:GainNode;
 		private _lastNode:AudioNode;

 		private _context:webkitAudioContext;

 		constructor(name:string, context:webkitAudioContext, gain?:number=1) {
 			super();
 			Group.allGroups[name] = this;

 			this._context = context;
 			if (this._context.createGain)
	 			this._gain = this._context.createGain();
			else
				this._gain = this._context.createGainNode(); 			
 			this._gain.gain.value = gain;
 			this._lastNode = this._gain;
 			this._gain.connect(this._context.destination);
 			

 		}

 		public getNode():AudioNode {
 			return this._gain;
 		}

 		public addEffect(effectType:string, instanceName:string):Effect {
 			var ef:Effect = new Effect(effectType, instanceName, this._context);
 			ef.getNode().connect(this._context.destination);
 			this._lastNode.disconnect();
 			this._lastNode.connect(ef.getNode());
 			this._lastNode = ef.getNode();
 			this._effects.push(ef);
 			return ef;
 		}

 		public setGain(value:number, time?:number = 0) {
 			this._gain.gain.value = value;
 		}

	}

	export class Effect extends AQObject {

		// hashmap
		private static allEffects:Effect[] = new Array();
		public static getEffect(name:string):Effect {
			return Effect.allEffects[name];
		}

		private _type:string;
		private _instanceName:string;
		private _node:AudioNode;
		private _context;
		private _paramMap:string[] = new Array();


		constructor(effectType:string, instanceName:string, context:webkitAudioContext) {
			super();
			this._context = context;

			// easy-to-retrieve-thingy..
			Effect.allEffects[instanceName] = this;

			this._type = effectType;
			this._instanceName = instanceName;
			this._setupNode();

		}
		private _setupNode():void {
/*
#define kJSAEEffectIdFlangerTitle "Flanger"
#define kJSAEEffectIdLowpassTitle "Lowpass"
#define kJSAEEffectIdTapeDelayTitle "TapeDelay"
#define kJSAEEffectIdDirtyDistTitle "DirtyDist"
x #define kJSAEEffectIdBiquadFilterHighpassTitle "HighpassFilter"
x #define kJSAEEffectIdBiquadFilterLowpassTitle "LowpassFilter"
x #define kJSAEEffectIdBiquadFilterBandpassTitle "BandpassFilter"
x #define kJSAEEffectIdBiquadFilterPeakTitle "PeakFilter"
x #define kJSAEEffectIdBiquadFilterLowshelfTitle "LowshelfFilter"
x #define kJSAEEffectIdBiquadFilterHighshelfTitle "HighshelfFilter"
? #define kJSAEEffectIdPanTitle "Pan"
#define kJSAEEffectIdAmpModulationTitle "AmpModulation"
#define kJSAEEffectIdReverbTitle "Reverb"
*/

			switch (this._type) {
				case "Pan":
					this._node = this._context.createPanner();
					break;
				case "Lowpass":
					this._node = this._context.createBiquadFilter();
					this._node["type"] = 0;
					this._paramMap["freq"] = "frequency";
					this._paramMap["detune"] = "detune";
					this._paramMap["resonance"] = "Q";
					this._paramMap["gain"] = "gain";

					break;
				case "HighpassFilter":
					this._node = this._context.createBiquadFilter();
					this._node["type"] = 1;
					this._paramMap["freq"] = "frequency";
					this._paramMap["detune"] = "detune";
					this._paramMap["resonance"] = "Q";
					this._paramMap["gain"] = "gain";
					break;
				case "LowpassFilter":
					this._node = this._context.createBiquadFilter();
					this._node["type"] = 0;
					this._paramMap["freq"] = "frequency";
					this._paramMap["detune"] = "detune";
					this._paramMap["resonance"] = "Q";
					this._paramMap["gain"] = "gain";
					break;
				case "BandpassFilter":
					this._node = this._context.createBiquadFilter();
					this._node["type"] = 2;
					this._paramMap["freq"] = "frequency";
					this._paramMap["detune"] = "detune";
					this._paramMap["resonance"] = "Q";
					this._paramMap["gain"] = "gain";
					break;
				case "PeakFilter":
					this._node = this._context.createBiquadFilter();
					this._node["type"] = 5;
					this._paramMap["freq"] = "frequency";
					this._paramMap["detune"] = "detune";
					this._paramMap["resonance"] = "Q";
					this._paramMap["gain"] = "gain";
					break;
				case "LowshelfFilter":
					this._node = this._context.createBiquadFilter();
					this._node["type"] = 3;
					this._paramMap["freq"] = "frequency";
					this._paramMap["detune"] = "detune";
					this._paramMap["resonance"] = "Q";
					this._paramMap["gain"] = "gain";
					break;
				case "HighshelfFilter":
					this._node = this._context.createBiquadFilter();
					this._node["type"] = 4;
					this._paramMap["freq"] = "frequency";
					this._paramMap["detune"] = "detune";
					this._paramMap["resonance"] = "Q";
					this._paramMap["gain"] = "gain";
					break;
				default:
					// nop
			}
		}


		public getNode():AudioNode {
			return this._node;
		}

		public setParam(paramName:string, value:number, time?:number = 0):number {
			//console.log("setting param: "+this._paramMap[paramName]+" value: "+value);
			if (time == 0)
				this._node[this._paramMap[paramName]]["value"] = value;
			else {
				var now:number = this._context.currentTime;
				var ap:AudioParam = this._node[this._paramMap[paramName]];
				ap.cancelScheduledValues(now);
				ap.setValueAtTime(ap.value, now);
				if (this._paramMap[paramName] == "frequency")
					ap.exponentialRampToValueAtTime(value, now+time);
				else
					ap.linearRampToValueAtTime(value, now+time);

			}
			// map etc..
			return time;
		}

		public getParam(paramName:string):number {
			return this._node[this._paramMap[paramName]]["value"];
		}
	}
}