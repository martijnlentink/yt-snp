/*
 * Seek 'n Play is an application developed by Circularify
 */

// Main method
window.onload = function() {
 
	// First globalize the options page
	YTSNP.i18n.performTranslation();

	// Bind the settings
	YTSNP.settings.ready = function () {
		YTSNP.settings.bind();
	};
}