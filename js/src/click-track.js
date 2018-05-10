// A snippet to provide an omniture custom link track

module.exports = function clickTrack(uniquePhrase, isALink=false, debug=false){
	if (debug) console.log(`Tracking ${uniquePhrase}`);
	try{
		linkType = isALink ? true : this;

		s.linkTrackVars = "server,prop3,prop20,prop28,prop33,prop34,prop57,eVar3,eVar20,eVar21,eVar34,eVar35,eVar36,eVar37,eVar38,eVar39,eVar51";
		s.linkTrackEvents = "";
		s.prop57 = uniquePhrase;
		s.tl(
		   // Since we're not actually tracking a link click, use true instead of `this`.  This also supresses a delay
		  linkType,
		   // linkType, 'o' for custom link
		   'o',
		   // linkName
			uniquePhrase,
		   // variableOverrides
		   null
		);
	}
	catch (ReferenceError){
		console.warn('You must be running this locally. *OR* Omniture is not loaded. Skipping analytics.');
	}
}