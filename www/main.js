function createButton(title, callback) {
    var button1 = document.createElement('button');
    button1.innerText = title;
    button1.onclick = function () {
        callback(title);
    };
    document.body.appendChild(button1);
}
var aqcb = function (event, val) {
    if(event == AudioCue.AudioCueEvents.READY) {
        var events = AudioCue.AQController.getInstance().getEvents();
        for(var prop in events) {
            createButton(events[prop].name, function (arg) {
                var res = AudioCue.AQController.getInstance().dispatchEvent(arg);
                console.log("Sent event: " + arg + " Will happen in: " + res + " seconds.");
            });
        }
    } else if(event == AudioCue.AudioCueEvents.PROGRESS) {
        console.log("AQ progress: " + val);
    }
};
AudioCue.AQController.createInstance("btb.json", [
    "sounds.json", 
    "events.json", 
    "routing.json"
], aqcb).init();
