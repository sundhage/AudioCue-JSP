module AudioCue {
	interface ISound {
		getDuration():number;
		getMusicalLength():number;
		getContext():webkitAudioContext;
		play(time:number, group?:Group):PlayingSound;
		stopPlayingSound(p:PlayingSound, time:number);
	}

}