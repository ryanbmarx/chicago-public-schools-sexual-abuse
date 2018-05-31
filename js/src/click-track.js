// A snippet to provide an omniture custom link track

function clickTrack(uniquePhrase, isALink=false, debug=false){
	try{
		 // madeUpFunc(false);
		// If you're not actually tracking a link click, use true instead of `this` to supress a delay
		const linkType = isALink ? true : this;
		s.linkTrackVars = "server,prop3,prop20,prop28,prop33,prop34,prop57,eVar3,eVar20,eVar21,eVar34,eVar35,eVar36,eVar37,eVar38,eVar39,eVar51";
		s.linkTrackEvents = "";
		s.prop57 = uniquePhrase;
		   // linkType, 'o' for custom link
		s.tl(linkType,'o',uniquePhrase, null);
	}
	// catch (ReferenceError){
	// 	console.warn('You must be running this locally. *OR* Omniture is not loaded. Skipping analytics.');
	// }

	catch (error){
		console.warn('You must be running this locally. *OR* Omniture is not loaded. Skipping analytics.');
		console.error(error);
	}

	finally{
		if (debug) console.log(`Tracking ${uniquePhrase}`);
	}
}

module.exports = clickTrack;