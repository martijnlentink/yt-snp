/*
 * Seek 'n Play is an application developed by Circularify
 */

// YTAPI Object
var ytapi = function() {

	// Returns the player API interface or false if it's not ready.
	function _getPlayer() 
	{
		return window.yt.player 
			&& window.yt.player.getPlayerByElement
			&& window.yt.player.getPlayerByElement(document.getElementById('player-api'));
	};
	
	// Get the video ID from the current URL.
	function _retrieveIdFromUrl(url)
	{
		var url = url || document.location.href;
		var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
	    var match = url.match(regExp);
	    if (match&&match[1])
	        return match[1];
	    return null;
	};
	
	// Perform an spf navigation and inform the player
	function _performNavigation(url) {
		spf.navigate(url);
		navigateBackward(url);
	}

	// Exposable Object
	return {
		getPlayer	: _getPlayer,
		getVideoId	: _retrieveIdFromUrl,
		navigate	: _performNavigation
	};
};

// Define or reference main object
var circularify = circularify || {};

// Add YTAPI object to main
circularify.ytapi = circularify.ytapi || ytapi();