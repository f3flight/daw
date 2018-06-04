"use strict";

gs.changeComposition = obj => {
	const cmp = gs.currCmp,
		currDur = cmp.duration;

	console.log( "changeComposition", obj );
	gs.currCmpSaved = gs.undoredo.getCurrentAction() === gs.actionSaved;
	ui.cmps.saved( !gs.isCompositionNeedSave() );
	if ( obj.blocks ) {
		wa.maingrid.assignChange( obj.blocks );
		cmp.duration = wa.maingrid.scheduler.duration;
		// lg(cmp.duration, Object.values( gs.currCmp.blocks )[ 0 ].duration)
	}
	if ( obj.tracks || obj.blocks ) {
		common.assignDeep( ui.mainGridSamples.data, obj );
	}
	if ( obj.synths ) {
		Object.entries( obj.synths ).forEach( ( [ id, obj ] ) => {
			const crudAct = obj ? wa.synths._synths[ id ] ? "update" : "create" : "delete";

			wa.synths[ crudAct ]( id, obj );
			ui.synths[ crudAct ]( id, obj );
		} );
		if ( cmp.synthOpened in obj.synths ) {
			ui.synth.change( obj.synths[ cmp.synthOpened ] );
		}
	}
	if ( obj.patterns ) {
		Object.entries( obj.patterns ).forEach( ( [ id, obj ] ) => {
			const crudAct = obj ? ui.patterns.list.has( id ) ? "update" : "create" : "delete";

			ui.patterns[ crudAct ]( id, obj );
		} );
	}
	if ( obj.keys ) {
		Object.entries( obj.keys ).forEach( ( [ keysId, keys ] ) => {
			Object.entries( cmp.patterns ).some( ( [ patId, pat ] ) => {
				if ( pat.keys === keysId ) {
					gs.updatePatternContent( patId );
					wa.maingrid.assignPatternChange( pat, keys );
					if ( patId === cmp.patternOpened ) {
						wa.pianoroll.assignPatternChange( keys );
						common.assignDeep( ui.pattern.pianoroll.data, keys );
					}
					return true;
				}
			} );
		} );
	}
	if ( obj.bpm ) {
		wa.controls.setBPM( obj.bpm );
		ui.controls.bpm( obj.bpm );
	}
	if ( obj.beatsPerMeasure || obj.stepsPerBeat ) {
		ui.mainGridSamples.timeSignature( cmp.beatsPerMeasure, cmp.stepsPerBeat );
		ui.pattern.pianoroll.timeSignature( cmp.beatsPerMeasure, cmp.stepsPerBeat );
		Object.keys( cmp.patterns ).forEach( gs.updatePatternContent );
	}
	if ( obj.name != null || obj.bpm || Math.ceil( cmp.duration ) !== Math.ceil( currDur ) ) {
		ui.cmps.update( cmp.id, cmp );
	}
};
