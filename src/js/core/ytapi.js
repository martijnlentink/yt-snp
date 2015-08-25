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
	
			
	// Saves the time of the player and restores it when it's reloaded
	function _restoreTime() {
		var player = _getPlayer();
		var time = player.getCurrentTime();
		// Wait for the page to load, and then set the old time so we can continue.
		circularify.utils.wait(function () { return document.getElementById("eow-title"); }, function () {
			player.seekTo(time);
		});
	}
	
	function _callWait() {
		var el;
		circularify.utils.wait(function() { return (el = document.getElementsByClassName("html5-player-chrome")[0]);}, addButtons);	
	}

	// Exposable Object
	return {
		getPlayer	: _getPlayer,
		getVideoId	: _retrieveIdFromUrl,
		restoreTime	: _restoreTime,
		callWait 	: _callWait
	};
};

// Define or reference main object
var circularify = circularify || {};

// Add YTAPI object to main
circularify.ytapi = circularify.ytapi || ytapi();