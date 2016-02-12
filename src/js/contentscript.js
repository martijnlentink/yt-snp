/**
 * Seek 'n Play is an application developed by Circularify
 */
 
circularify.omni.analytics.initialize('UA-50232941-1');
circularify.omni.page.injectScript(circularify.core.files.ytapi);
circularify.omni.page.injectScript('js/ytsnp.js');
circularify.omni.page.injectCss('css/ytsnp.css');

// Add SNP to the Circularify list of installed extension
circularify.omni.register("snp");
 
// Main method.
circularify.omni.page.injectScript(function () {
	// Next URL
	var _url = null;
	
	// Subscribe to the popstate event to handle going back in history
	window.addEventListener("popstate", _navigateBackward);
	// Every navigation we get notified by SPF what the new URL is
	window.addEventListener("spfrequest", _spfrequest);
	// Singles if snp is ready on the page
	window.addEventListener("circReady", _circReady);

	function _spfrequest(event) {
		_url = event.detail.url;
	}

	// Function that handles a navigation going back in history
	function _navigateBackward(event) {
		var url = _url;
		if (circularify.ytsnp.shouldCornerize(url)) {
			circularify.ytsnp.cornerize();
		}
		else {
			circularify.ytapi.restoreTime(url);
			circularify.ytsnp.decornerize();
		}
	}
	
	function _navigateForward(url) {
		// Get the URL
		url = _url || window.location.href;
	
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
		
		// If there are no settings, take default
		return {
			position: "bottom",
		};
	}
	

	function _doesVideoIdMatchCurrent (video_id) {
		return video_id == circularify.ytapi.getVideoId();
	};

	function _circReady() {
		window.removeEventListener(circularify.core.events.circReady, this);
		// Navigating function
		window.YTSPPreventRequeue = _doesVideoIdMatchCurrent;
		
		// Set Navigation Subscribtion
		window.YTSPNavigating = circularify.mailoffice.sendMailman;
		circularify.mailoffice.subscribe(_navigateForward);
	}
	
	window.yttrcooldown = 0;
});

