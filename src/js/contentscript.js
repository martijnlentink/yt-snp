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
injectCss(".ytp-button.closeButton { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAbCAYAAABr/T8RAAABsklEQVR42u2Vu2oCURCGLazEIpLNYikiFkLuiw9gEsyTKCS1cZM001r6DFZWllYiVlYWCiLe76uyL5H5h5yFQDqPpMgO/Hh2Ocw3/8zZYyDghx9+/EUsl8vIZrPJOI6T2+12BWi/3+e32+3jYDA4Pwl0vV5fMeiNIcRrT3iGuAB7sVjc6YZeMpTYMR0OB8JagbF2XddbM/xWC3Q+n59xUhtQJG40GtTpdASGIvr9PtXrdXGNPTyKDy1tZwcZ5RSAYDBIiUSCut2ugNLpNPE2qlQqUgzerVarrI4DlWPX4rbVapFpmgJKpVIeNBQKUa1Wk+IA5mJfjwbPZrMCwBASN5tNisViAoRQCKBwq/axilrBcI1fy7I8cDwel7ajKK3gyWSSRzKcWgBUe8PhMBmGIetkMkntdlsOGPZysce3ejqdPrDEbbVa/TFTzDwajcq7crnstXs8Hj8fDe71ehEG26qNAKAA9TnhpJdKJUJx324/h8OhoeVb5kTXSAypC0Q9o71qvnjm0dxrvb1Go9ENJy0q4C96Z1knua9xI3ErnxjwgiIgHCR2m+W5Xvh/o3787/gC1AnEP1lhBDEAAAAASUVORK5CYII=); float: right; width: 30px; height: 27px; background-repeat: no-repeat; }");
injectCss(".ytp-button.backToVideoButton { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAbCAYAAABr/T8RAAAA30lEQVR42mNgGAWjYBTQA9TX1/MBcURdXV07kF4PxNeB+D0QR9HaYruGhob/2DBQroZuFgP5n4G4DIh9gFiJrj4Gim0FYh66BTWQvR+JfRaIJWhpsRmSZVpAXAHEf6H8+0AsQ0vLs4D4N8hiKD8IiL9CUzko1eshqZUDYg9qWu4BMhSJrwe1dD3UEUFQcS2oI7NoGRIyoOCGBvtfaDRoIUWNGS0tlwAlNBwJ0I7WKZ8HlMWwZDs7WlqqBC1MQIXKZ3paXIOnSKV5UEdBKw5QBbIeWqFEgFL9aDU7CkYWAAC9I/K7az2Q5QAAAABJRU5ErkJggg==); float: right; width: 30px; height: 27px; background-repeat: no-repeat; }");
