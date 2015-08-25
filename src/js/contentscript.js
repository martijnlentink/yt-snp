/*
 * Seek 'n Play is an application developed by Circularify
 */
 
 
injectLf("chrome-extension://gampafojcnimhliilaajkhakfibimoij/js/core/modules.js");
injectLf("chrome-extension://gampafojcnimhliilaajkhakfibimoij/js/core/ytapi.js");
injectLf("chrome-extension://gampafojcnimhliilaajkhakfibimoij/js/core/ytsnp.js");

// Main method.
inject(function () {
	
	// Subscribe to the popstate event to handle going back in history
	window.addEventListener("popstate", function () { navigateBackward(); });
	
	function navigateForward(url) {		
	
		// Get the URL
		url = url || window.location.href;
		// Reference to the player object
		var element = document.getElementById("player-api");
	
		// Get a reference job
		var player = circularify.ytapi.getPlayer();
		
		// Check if the player exists
		if(player) {
			// And if it exists, make sure we don't show an empty video.
			if(player.getVideoUrl() && !player.getVideoUrl().endsWith("youtube.com/watch")) {
		
				// While navigation we put the video in the bottom right corner
				if (circularify.ytsnp.shouldCornerize(url)) {
									
					//console.log(chrome.extension);
					//chrome.extension.sendMessage({action: "ytspNavigating"});
				
					circularify.ytsnp.cornerize(element);
				}
				// And if we go (back) to a video, put it back to normal position and size
				else {
					decircularify.ytsnp.decornerize(element);
				}
			}
		}
	};
	
	// Function that handles a navigation going back in history
	function navigateBackward(url) {

		var element = document.getElementById("player-api");
		if (circularify.ytsnp.shouldCornerize(url)) {
			circularify.ytsnp.cornerize(element);
		}
		else {
			circularify.ytapi.restoreTime();
			decircularify.ytsnp.decornerize(element);
		}
	}
	
	// Perform an spf navigation and inform the player
	function performNavigation(url) {
		spf.navigate(url);
		navigateBackward(url);
	}
	
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
		if(circularify !== undefined) {
			window.YTSPNavigating = circularify.mailoffice.sendMailman;
			circularify.mailoffice.subscribe(navigateForward);
			clearTimeout(this);
		}
	}, 1000);
	
	window.getSettings = getSettings;
});

// Get settings and save them locally
chrome.storage.onChanged.addListener(function(changes, namespace) {
	
	// Get the new saved position
	var position = changes["settings"].newValue.position
	
	// Create a new settings object
	var str = { "settings": { "position": position } };
	
	// Save the new settings object in localStorage
	window.localStorage["SP-settings"] = JSON.stringify(str);
});

// Inject linked file
function injectLf(fn) {
	var script = document.createElement('script');
	script.src = fn;
	document.body.appendChild(script);
}

// Inject function
function inject(fn) {
	var script = document.createElement('script');
	script.innerHTML = '(' + fn.toString() + ')();';
	document.body.appendChild(script);
}

// Inject some CSS
function injectCss(css) {
	var element = document.createElement('style');
	element.innerHTML = css.toString();
	document.head.appendChild(element);
}

// Inject custom css
injectCss(".ytp-button.closeButton { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAtUlEQVR42u2ZUQqAMAxDPfpuPhH0RxCda9q90oC/yQs43bptK5VKJYx67+14kP6n+aWG8r+Zm4dI/R/MzUKk/i/m0yFS/4/mv0PU/qMBQyFKb3mQG7wi0B3eMjgM3gIgHH4GZBn4iRLrwItL+MCLSvjCG5eIgTcqEQs/WWINeHwB9CuEXsTozyj6R4beSqA3c+jtNPpAgz5Sog/1+LEKfrCFHy2mGO6mGK+nuOBIccVUKpVKEu0fhMn/KTmm8QAAAABJRU5ErkJggg==); float: right; width: 26px; height: 36px; background-repeat: no-repeat; background-size: 18px; margin: 10px 0 0 0; }");
injectCss(".ytp-button.backToVideoButton { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAq0lEQVR42u2WMQ6AMAwDefr9vCwMDBRaUSQ7+KROzRC3iZNtCyEESdoacBaA8w/gXEI49wDOTYy7C1HBRnEXYN/EJWy0xCCTXSU4jqUATne4lRAX97g0MTcxqNsoA3GoDjJmYuVWia8fZ/aB1JJvsyWqmPyUSagmP2zTyskPDUr15B9XFRcBXRxKSFfAChHKNuoj4I0IxVUiAlJCv2piaxu1HmQlVokQQuiyA8w7ot5QnoO3AAAAAElFTkSuQmCC); float: right; width: 26px; height: 36px; background-repeat: no-repeat; background-size: 18px; margin: 10px 0 0 6px; }");
injectCss(".chrmbtn-search { width: 480px !important; left: 0px !important; }"); 