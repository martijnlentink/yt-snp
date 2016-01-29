/**
 * Seek 'n Play is an application developed by Circularify
 */
 
circularify.omni.analytics.initialize('UA-50232941-1');
circularify.omni.page.injectScript(circularify.core.files.ytapi);
circularify.omni.page.injectScript('js/ytsnp.js');
circularify.omni.page.injectCss('css/ytsnp.css');
 
// Main method.
circularify.omni.page.injectScript(function () {

	var _history = [];
	
	// Subscribe to the popstate event to handle going back in history
	window.addEventListener("popstate", navigateBackward);

	// Function that handles a navigation going back in history
	function navigateBackward(event) {
		var url = _history.pop();
		if (circularify.ytsnp.shouldCornerize(url)) {
			circularify.ytsnp.cornerize();
		}
		else {
			circularify.ytapi.restoreTime(url);
			circularify.ytsnp.decornerize();
		}
	}
	
	function navigateForward(url) {
		// Get the URL
		url = url || window.location.href;
		if (_history.slice(-1)[0] == url)
			return;
		debugger;
		// Add location history
		_history.push(url);
	
		// Get a reference job
		var player = circularify.ytapi.getPlayer();
				
		// Check if the player exists
		if(player) {
			// And if it exists, make sure we don't show an empty video.
			if(player.getVideoUrl() && !player.getVideoUrl().endsWith("youtube.com/watch")) {
		
				// While navigation we put the video in the bottom right corner
				if (circularify.ytsnp.shouldCornerize(url)) {
									
					circularify.ytsnp.cornerize();
				}
				// And if we go (back) to a video, put it back to normal position and size
				else {
					circularify.ytsnp.decornerize();
				}
			}
		}
	};
	
	// Get the locally saved settings
	function getSettings() {
	
		// If the settings exist, then return is
		if (window.localStorage && window.localStorage["SP-settings"]) {
			return JSON.parse(window.localStorage["SP-settings"]).settings;
		}
		
		// If there are no settings, take defaulf
		return {
			position: "bottom",
		};
	}
	

	function doesVideoIdMatchCurrent (video_id) {
		return video_id == circularify.ytapi.getVideoId();
	};

	// Navigating function
	window.YTSPPreventRequeue = doesVideoIdMatchCurrent;
	
	// Set Navigation Subscribtion
	setTimeout(function() {
		if(circularify) {
			window.YTSPNavigating = circularify.mailoffice.sendMailman;
			circularify.mailoffice.subscribe(navigateForward);
			clearTimeout(this);
		}
	}, 1000);
		
		
	window.yttrcooldown = 0;
});

