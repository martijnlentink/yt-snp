
var circularify.ytsnp = circularify.ytsnp || {

	/* Region Public Functions */
	getPlayer	: _getPlayer;
	getVideoId	: _retrieveIdFromUrl;
	
	/* Region: Private Functions */
	
	// Returns the player API interface or false if it's not ready.
	function _getPlayer() {
		return window.yt.player 
			&& window.yt.player.getPlayerByElement
			&& window.yt.player.getPlayerByElement(document.getElementById('player-api'));
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
	}

};