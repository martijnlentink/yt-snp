/*
 * Seek 'n Play is an application developed by Circularify
 */
 
// Main method.
inject(function () {

	// Enable Ajax loading and force HTML5 player
	/*window.ytspf = window.ytspf || {};
	Object.defineProperty(window.ytspf,'enabled',{value:true});
	ytplayer.config.html5=true;
	delete ytplayer.config.args.ad3_module;*/
		
	// Returns the player API interface or false if it's not ready.
	function getPlayer() {
		return window.yt.player 
			&& window.yt.player.getPlayerByElement
			&& window.yt.player.getPlayerByElement(document.getElementById('player-api'));
	}	
	
	// Get the video ID from the current URL.
	function getVideoIdFromUrl()
	{
		var url = window.location.href;
		var vidIdSplit = url.split("watch?v=");
		return vidIdSplit[1];
	}

	// Reference the player object using a 'wait' call.
	var el;
	wait(function() { return (el = document.getElementsByClassName("html5-player-chrome")[0]);}, addButtons);
	
	// Function to add the close & back buttons to the player
	function addButtons() {
		// Inject close button code in YouTube player
		var button = document.createElement('div');
		button.className = 'ytp-button closeButton';
		button.setAttribute('role', 'button');
		button.setAttribute('aria-label', 'Close player');
		button.setAttribute('tabindex', '6240');
		button.style.display = 'none';
		el.appendChild(button);
		
		// Add an eventlistener on event 'click', so we can handle the closing
		button.addEventListener('click', function (event) {
			var playel = document.getElementById('player-api');
			playel.removeAttribute("style");
			var player = getPlayer();
			player.cueVideoById();
			hideButtons();
		});
		
		// Inject close button code in YouTube player
		button = document.createElement('div');
		button.className = 'ytp-button backToVideoButton';
		button.setAttribute('role', 'button');
		button.setAttribute('aria-label', 'Back to video');
		button.setAttribute('tabindex', '6241');
		button.style.display = 'none';
		el.appendChild(button);
		
		// Add an eventlistener on event 'click', so we can handle the closing
		button.addEventListener('click', function (event) {
			var url = getPlayer().getVideoUrl();
			performNavigation(url);
			hideButtons();
		});
	}
	
	
	// Function to add buttons to the page
	function displayButtons() {
		var closeButton;
		var backButton;
		
		wait(function () { return (closeButton = document.getElementsByClassName("closeButton")[0]) && (backButton = document.getElementsByClassName("backToVideoButton")[0]); }, function () {
			closeButton.style.display = 'block';
			backButton.style.display = 'block';
		});
	}
	
	// Function to remove buttons from the page
	function hideButtons() {
		var closeButton;
		var backButton;
		
		wait(function () { return (closeButton = document.getElementsByClassName("closeButton")[0]) && (backButton = document.getElementsByClassName("backToVideoButton")[0]); }, function () {
			closeButton.style.display = 'none';
			backButton.style.display = 'none';
		});
	}
	
	// Wait until the YouTube API's ready.
	function wait(target, action) {
		setTimeout(target() ? action : function () { wait(target, action)}, 100);
	}
	
	// Checks wether the player should go in the corner
	function shouldCornerize(location) {
		location = location || window.location.href;
		return !location.match(/\/watch\?.*v=.{8,}/);
	}
	
	// Subscribe to the popstate event to handle going back in history
	window.addEventListener("popstate", function () { navigateBackward(); });
	
	// Function that handles a navigation going back in history
	function navigateBackward(url) {

		var element = document.getElementById("player-api");
		if (shouldCornerize(url)) {
			cornerize(element);
		}
		else {
			restoreTime();
			decornerize(element);
		}
	}

	// Put the element in the corner
	function cornerize(element) {		
		
		// Get a reference job
		var player = getPlayer();
		
		// Check if the player exists
		if(player) {
			// And if it exists, make sure we don't show an empty video.
			if(player.getPlaybackQuality() !== "unknown" && player.getPlaybackQuality() !== "undefined") {

				// Make sure the player is visible and not somewhere far to the left
				//element.className = element.className.replace(/\off-screen-target\b/,'');
				element.firstChild.style.display = "block";

				// Player sizing and positioning
				element.style.width = "480px";
				element.style.height = "300px";
				element.style.right = "10px";
				element.style.position = "fixed";
				element.style.zIndex = "999";
				
				// Get the saved settings object and position the player according to the setting
				var settings = getSettings();
				if(settings.position == "top") { // Positioned on top
					element.style.top = "70px";
				} else {						// Positioned on bottoms
					element.style.bottom = "10px";
				}
				
				// Making sure the video scales when cornerizing
				var video = document.getElementsByClassName("html5-main-video");
				video[0].style.width = "480px";
				video[0].style.height = "270px";

				// We're searching, so add the buttons (close & back)
				displayButtons();
			}
		}
	}
	
	// Removes the player from the corner and resets player size
	function decornerize(element) {
		
		/* 
			Code below is used to check if the current video playing is the
			video that is supposed to play 
		*/
		
		// Retrieve "supposed to play" video ID from URL
		var videoId = retrieveIdFromUrl();
		
		// Reference the player and get the ID from the player object
		var player = getPlayer();
		
		var currVid = player.getVideoUrl().match(/[?&]v=([^&]+)/);
		
		// Check if the two match, and if not we load the new video
		if(videoId != currVid) {
			player.loadVideoById(videoId, 0, "hd720");
		}
			
		// Continue as you were.
		element.removeAttribute("style");
		element.firstChild.firstChild.lastChild.removeAttribute("style");
		document.getElementsByClassName("html5-main-video")[0].removeAttribute("style");
		hideButtons();
	}
			
	// Saves the time of the player and restores it when it's reloaded
	function restoreTime() {
		var player = getPlayer();
		var time = player.getCurrentTime();
		// Wait for the page to load, and then set the old time so we can continue.
		wait(function () { return document.getElementById("eow-title"); }, function () {
			player.seekTo(time);
		});
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
	
	// Add 'endsWith' method for URL sake
	// Reference: https://coderwall.com/p/9nfu0a
	if (typeof String.prototype.endsWith === 'undefined') {
		String.prototype.endsWith = function(suffix) {
			if (typeof suffix === 'String') {
				return this.indexOf(suffix, this.length - suffix.length) !== -1;
			}else if(suffix instanceof Array){
				return _.find(suffix, function(value){
					console.log(value, (this.indexOf(value, this.length - value.length) !== -1));
					return this.indexOf(value, this.length - value.length) !== -1;
				}, this);
			}
		};
	}
	
	// Perform an spf navigation and inform the player
	function performNavigation(url) {
		spf.navigate(url);
		navigateBackward(url);
	}
	
	// Navigating function
	window.YTSPNavigating = navigateForward;
	function navigateForward(url) {		
		
		// Get the URL
		url = url || window.location.href;
		// Reference to the player object
		var element = document.getElementById("player-api");
	
		// Get a reference job
		var player = getPlayer();
		
		// Check if the player exists
		if(player) {
			// And if it exists, make sure we don't show an empty video.
			if(player.getVideoUrl() && !player.getVideoUrl().endsWith("youtube.com/watch")) {
		
				// While navigation we put the video in the bottom right corner
				if (shouldCornerize(url)) {
					cornerize(element);
				}
				// And if we go (back) to a video, put it back to normal position and size
				else {
					decornerize(element);
				}
			} else {
				var videoId = getVideoIdFromUrl();
				player.loadVideoById(videoId, 0, "hd720");
			}
		}
	};
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