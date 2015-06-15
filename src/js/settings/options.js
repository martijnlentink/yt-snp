/*
 * Seek 'n Play is an application developed by Circularify
 */

// Main method
window.onload = function() {
 
	// First globalize the options page
	circularify.i18n.performTranslation();

	// Bind the settings
	circularify.settings.registerSettingsLoaded(function () {
		circularify.settings.bind();
	});
}