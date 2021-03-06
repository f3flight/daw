"use strict";

class waPianoroll {
	constructor() {
		const sch = new gswaScheduler();

		this.scheduler = sch;
		sch.currentTime = () => wa.ctx.currentTime;
		sch.ondatastart = this._startKey.bind( this );
		sch.ondatastop = this._stopKey.bind( this );
		this._keysStarted = {};
		this._keysStartedLive = {};
	}

	// ........................................................................
	assignPattern( id ) {
		this.scheduler.empty();
		this._pattern = gs.currCmp.patterns[ id ];
		this.assignPatternChange( gs.currCmp.keys[ this._pattern.keys ] );
	}
	assignPatternChange( data ) {
		common.assignDeep( this.scheduler.data, data );
		if ( gs.controls.patternLoopA === false ) {
			const beatPM = gs.currCmp.beatsPerMeasure,
				b = Math.ceil( this._pattern.duration / beatPM );

			this.scheduler.setLoopBeat( 0, Math.max( 1, b ) * beatPM );
		}
	}
	setLoop( a, b ) {
		if ( !Number.isFinite( a ) ) {
			a = 0;
			b = Math.ceil( this._pattern.duration / gs.currCmp.beatsPerMeasure );
			b = Math.max( 1, b ) * gs.currCmp.beatsPerMeasure;
		}
		this.scheduler.setLoopBeat( a, b );
	}
	start( off ) {
		this.setLoop( gs.controls.patternLoopA, gs.controls.patternLoopB );
		if ( this._pattern ) {
			this.scheduler.startBeat( 0, off );
		}
	}

	// ........................................................................
	liveStartKey( midi ) {
		if ( !( midi in this._keysStartedLive ) ) {
			this._keysStartedLive[ midi ] = wa.synths.current.startKey(
				midi, this.scheduler.currentTime(), 0, Infinity, .8, 0 );
		}
	}
	liveStopKey( midi ) {
		if ( this._keysStartedLive[ midi ] ) {
			wa.synths.current.stopKey( this._keysStartedLive[ midi ] )
			delete this._keysStartedLive[ midi ];
		}
	}

	// ........................................................................
	_startKey( startedId, blc, when, off, dur ) {
		this._keysStarted[ startedId ] =
			wa.synths.current.startKey( blc.key, when, off, dur, blc.gain, blc.pan );
	}
	_stopKey( startedId, blc ) {
		wa.synths.current.stopKey( this._keysStarted[ startedId ] );
		delete this._keysStarted[ startedId ];
	}
}
