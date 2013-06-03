
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


//AudioCue.AQController.createInstance(["assets/btb/sounds.json", "assets/btb/events.json", "assets/btb/routing.json"], "assets/btb/", ".mp3", aqcb).init();


AudioCue.AQController.createInstance("assets/btb.json", ["sounds.json", "events.json", "routing.json"], aqcb).init();




