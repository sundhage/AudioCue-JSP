/*
	TODO:

-- CORE
	x Sound base class? (un-abstrahera web audio api)
	x Sequence
	x Arrangement
	x ArrangementController (top-level stuff)

	x Cued Arrangements

	x Events / Actions

	x Parse Events / Action (typ, ingen errorcheck)

	x SoundObjects

	x AudioCue singleton

	x ISound (interface)
	x Sound (conforms to ISound)
	x Silence (conforms to ISound)

	x externifiera Base64Binary

	x Poolable base class for temp objects and VO's? -> have static members for getting a new (clean) instance instead of the new statement...

	x Loading progress (fyfan, behöver nog fundera lite här...)

	x Group and Effects system

	x Groups and Effects param tweening
	x Actions


	xml2json (as a helper project? alt. export from Audio Cue app)
	
	errorhandling -> throw errors etc?
	
	x script for deploy + minimize etc
	

-- Actions
	x structure impl. 


-- Dev perks
	Logger / Error logger (olika outputs, gör ett interface etc)


-- Loading / Asset / Config
	x Audio Loader + event callbacks (+progress) (Hålla i contexts??, förhindra GC?)
	x json loader / parser (skippa xml, bygg en konverterare istället...)
	x convert to json -> http://www.utilities-online.info/xmltojson/#.UZ3PFLSbVTs
	x snyggifiera, möjliggör flera sätt att ladda in (skapa tools?)

-- Routing / Bus / Effects
	(ta reda på hur det funkar med nodes etc)
	x Groups
	x	Effects
	Bus


	Deployify? -> minimize, slå ihop till en fil, kolla hur man hookar ihop sig om det är ren js osv...

	typed functions: http://stackoverflow.com/questions/14638990/are-strongly-typed-functions-as-parameters-possible-in-typescript


	TID:	6h	måndag: installera TypeScript, research, test, början...
			6h	tisdag: implementering, sequence funkar typ
			4h	onsdag: snygga-upp, this-problem löst, sequence vidareutv. arrangement start
			2h	onsdag: ArrangementController 
			4h	torsdag: laddning, json parser / VO / init..
			4h	fredag: actions / events (inkl. parser)
			3h	fredag: AQController singleton (encap init proc etc..)
			6h	måndag:	Base64 support -> xcode projekt, loaders / parser etc.
			4h	tisdag: ISound, refactoring, Base64Binary i thirdparty, PoolController
			1h	onsdag: progress
			--- 40h ---
			4h	onsdag: groups and effect system + filter (biquad) impl.



*/



///<reference path='AQ/AQController.ts' />


// GUI helper function

function createButton(title:string, callback:any) {
	var button1 = document.createElement('button');
	button1.innerText = title;
	button1.onclick = function() { callback(title) };
	document.body.appendChild(button1);

}

// audio cue callback

var aqcb = function(event:string, val:number) {
	if (event == AudioCue.AudioCueEvents.READY) {
		var events:AudioCue.AQEvent[] = AudioCue.AQController.getInstance().getEvents();
		for (var prop in events) {
			createButton(events[prop].name, function(arg:any) {
				var res:number = AudioCue.AQController.getInstance().dispatchEvent(arg);
				console.log("Sent event: "+arg+ " Will happen in: "+res+ " seconds.");
			})
		}



	} else if (event == AudioCue.AudioCueEvents.PROGRESS) {
		console.log("AQ progress: "+val);
	}
}


//AudioCue.AQController.createInstance(["btb/sounds.json", "btb/events.json", "btb/routing.json"], "btb/", ".mp3", aqcb).init();

// todo: sync this and test.

AudioCue.AQController.createInstance("btb.json", ["sounds.json", "events.json", "routing.json"], aqcb).init();




