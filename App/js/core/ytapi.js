/**
 * This is an application developed by Circularify
 */

// Define or reference main object
var circularify = circularify || {};

// Add YTAPI object to main
circularify.ytapi = circularify.ytapi || (function() {

	_isPlayerReady = false;
	_player = null;
	// Returns the player API interface or false if it's not ready.
	function _getPlayer() 
	{
		return _player || (window.yt.player 
			&& window.yt.player.getPlayerByElement
			&& (_player = window.yt.player.getPlayerByElement(_getVideoElement())));
	};

	function _playerReadyEvent() {
		window.removeEventListener('circReady', this);
		try
		{
			var pElement = _getVideoElement();
			circularify.utils.wait(function () {
				return window.yt
				&& window.yt.player
				&& window.yt.player.getPlayerByElement
				&& (_player = window.yt.player.getPlayerByElement(pElement))
				&& (typeof _player["seekTo"] !== "undefined");
			}, function () {
				_isPlayerReady = true;
				window.dispatchEvent(new Event("ytPlayerReady"));
			});
		}
		catch (e)
		{
			window.addEventListener('circReady', _playerReadyEvent);
		}
	}

	function _getVideoElement()
	{
		return document.getElementById('player-api') || player;
	}
	
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
	function _restoreTime(url) {
		var startVideo = _retrieveIdFromUrl(url);
		var player = _getPlayer();
		var time = player.getCurrentTime();
		// Wait for the page to load, and then set the old time so we can continue.
		circularify.utils.wait(function () { return document.getElementById("eow-title"); }, function () {
			var newVideo = _retrieveIdFromUrl(window.location.href);
			if (newVideo == startVideo)
				player.seekTo(time);
		});
	}
	
	function _callWait() {
		var el;
		circularify.utils.wait(function() { return (el = document.getElementsByClassName("html5-player-chrome")[0]);}, addButtons);	
	}

	_playerReadyEvent();

	// Exposable Object
	return {
		isPlayerReady: _isPlayerReady,
		getPlayer	: _getPlayer,
		getVideoElement : _getVideoElement,
		getVideoId	: _retrieveIdFromUrl,
		restoreTime	: _restoreTime,
		callWait 	: _callWait
	};
})();