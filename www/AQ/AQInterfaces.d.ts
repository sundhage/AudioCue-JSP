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
module AudioCue {
	/**
		All playable objects should conform to this interface.
	*/
	interface ISound {
		/**
			returns the duration of the sound (in seconds)
		*/
		getDuration():number;
		/**
			returns the musical length of the sound (in seconds)
		*/
		getMusicalLength():number;
		/**
			returns the the audio context (obs, the audio context used should be global and shared thru the whole API)
		*/
		getContext():webkitAudioContext;
		/**
			Starts the sound
			@param time When to start the sound (relative from current time)
			@param group What group the sound should be played in. If null or omitted the sound will play directly to the contexts destination.
			@return A PlayingSound instance.
		*/
		play(time:number, group?:Group):PlayingSound;
		/**
			Stops a playing sound.
			@param p The PlayingSound instance returned by play
			@param time When to stop the sound (OBS, not yet implemented)
		*/
		stopPlayingSound(p:PlayingSound, time:number);
	}

}