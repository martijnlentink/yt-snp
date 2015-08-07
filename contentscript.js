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
	window.getPlayer = function () {
		return window.yt.player 
			&& window.yt.player.getPlayerByElement
			&& window.yt.player.getPlayerByElement(document.getElementById('player-api'));
	}	
	
	// Get the video ID from the current URL.
	function retrieveIdFromUrl(url)
	{
		var url = url || document.location.href;
		var regExp = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
	    var match = url.match(regExp);
	    if (match&&match[1])
	        return match[1];
	    return null;
	}

	// Reference the player object using a 'wait' call.
	var el;
	wait(function() { return (el = document.getElementsByClassName("ytp-time-display")[0]);}, function(){});
	var el2;
	wait(function() { return (el2 = document.getElementsByClassName("ytp-chrome-controls")[0]);}, addButtons);
	
	
	// Function to add the close & back buttons to the player
	function addButtons() {
		// Inject close button code in YouTube player
		var button = document.createElement('button');
		button.className = 'ytp-button closeButton snpButtonOld';
		button.setAttribute('role', 'button');
		button.setAttribute('aria-label', 'Close player');
		button.setAttribute('tabindex', '6240');
		button.style.display = 'none';
		el2.insertBefore(button, el2.childNodes[8]);
		
		// Add an eventlistener on event 'click', so we can handle the closing
		button.addEventListener('click', function (event) {
			var playel = document.getElementById('player-api');
			playel.removeAttribute("style");
			var player = getPlayer();
			player.cueVideoById();
			hideButtons();
		});
		
		// Inject back to video button code in YouTube player
		button = document.createElement('button');
		button.className = 'ytp-button backToVideoButton snpButtonOld';
		button.setAttribute('role', 'button');
		button.setAttribute('aria-label', 'Back to video');
		button.setAttribute('tabindex', '6241');
		button.style.display = 'none';
		el2.insertBefore(button, el2.childNodes[8]);
		
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
	
	// Check if the user has the new Player enabled
	function checkNewPlayer() {
	
		var newControls = document.getElementsByClassName("ytp-chrome-controls");
		
		if(newControls.length == 1) 
			return true;
		
		return false;	
	}

	var videoSize = {
		width: "640px",
		height: "360px",
		left: 0,
		top: "15px"
	};

	// Put the element in the corner
	function cornerize(element) {		
		window.YTSNPIsCorner = true;
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
				element.style.height = "270px";
				element.style.right = "10px";
				element.style.position = "fixed";
				element.style.zIndex = "999";

				var advertisements = document.getElementsByClassName("container autoalign");
				if (advertisements.length > 0)
				{
					advertisements[0].style.width = "auto";
				}

				var videoAdvertisements = document.getElementsByClassName("ad-container ad-container-single-media-element-annotations");
				if (videoAdvertisements.length > 0)
				{
					videoAdvertisements[0].style.width = "480px";
					videoAdvertisements[0].style.height = "270px";
				}
				
				// Put the "Continue To Video" button a little higher
				var continueToVideoContainer = document.getElementsByClassName("videoAdUiPreSkipContainer");
				var continueToVideoButton = document.getElementsByClassName("videoAdUiSkipContainer html5-stop-propagation");
				if(continueToVideoContainer.length == 1) {
					continueToVideoContainer[0].style.bottom = "25px";
				}
				if(continueToVideoButton.length == 1) {
					continueToVideoButton[0].style.bottom = "25px";
				}
				
				// Get the saved settings object and position the player according to the setting
				var settings = getSettings();
				if(settings.position == "top") { // Positioned on top
					element.style.top = "70px";
				} else {						// Positioned on bottoms
					element.style.bottom = "10px";
				}
								
				// Making sure the video scales when cornerizing
				var video = document.getElementsByClassName("html5-main-video");

				// Save for decornerizing
				videoSize.width = video[0].style.width;
				videoSize.height = video[0].style.height;

				video[0].style.width = "480px";
				video[0].style.height = "270px";
				video[0].style.top = "0px";
				video[0].style.left = "0px";
				
				var container = document.getElementsByClassName("ytp-chrome-bottom")[0];
				container.className = "ytp-chrome-bottom chrmbtn-search";
				
				// We're searching, so add the buttons (close & back)
				displayButtons();
			}
		}
	}
	
	// Removes the player from the corner and resets player size
	function decornerize(element) {
		window.YTSNPIsCorner = false;
		element.removeAttribute("style");
		// element.firstChild.firstChild.lastChild.removeAttribute("style");
		// document.getElementsByClassName("html5-main-video")[0].removeAttribute("style");
		document.getElementsByClassName("html5-main-video")[0].width = videoSize.width;
		document.getElementsByClassName("html5-main-video")[0].height = videoSize.height;
		document.getElementsByClassName("html5-main-video")[0].top = videoSize.top;
		document.getElementsByClassName("html5-main-video")[0].left = videoSize.left;
		
		var skipAdContainer = document.getElementsByClassName("videoAdUiPreSkipContainer");
		if (skipAdContainer.length > 0)
			skipAdContainer[0].removeAttribute("style");
		var skipAdButton = document.getElementsByClassName("videoAdUiSkipContainer html5-stop-propagation");
		if (skipAdButton.length > 0)
			skipAdButton[0].removeAttribute("style");
			
		var container = document.getElementsByClassName("ytp-chrome-bottom")[0];
			container.className = "ytp-chrome-bottom";
		
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
	

	function doesVideoIdMatchCurrent (video_id) {
		return video_id == retrieveIdFromUrl();
	};

	// Navigating function
	window.YTSPPreventRequeue = doesVideoIdMatchCurrent;
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
injectCss(".ytp-button.closeButton.snpButtonOld { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAtUlEQVR42u2ZUQqAMAxDPfpuPhH0RxCda9q90oC/yQs43bptK5VKJYx67+14kP6n+aWG8r+Zm4dI/R/MzUKk/i/m0yFS/4/mv0PU/qMBQyFKb3mQG7wi0B3eMjgM3gIgHH4GZBn4iRLrwItL+MCLSvjCG5eIgTcqEQs/WWINeHwB9CuEXsTozyj6R4beSqA3c+jtNPpAgz5Sog/1+LEKfrCFHy2mGO6mGK+nuOBIccVUKpVKEu0fhMn/KTmm8QAAAABJRU5ErkJggg==); float: right; width: 26px; height: 36px; background-repeat: no-repeat; background-size: 18px; margin: 10px 0 0 0; }");
injectCss(".ytp-button.backToVideoButton.snpButtonOld { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAq0lEQVR42u2WMQ6AMAwDefr9vCwMDBRaUSQ7+KROzRC3iZNtCyEESdoacBaA8w/gXEI49wDOTYy7C1HBRnEXYN/EJWy0xCCTXSU4jqUATne4lRAX97g0MTcxqNsoA3GoDjJmYuVWia8fZ/aB1JJvsyWqmPyUSagmP2zTyskPDUr15B9XFRcBXRxKSFfAChHKNuoj4I0IxVUiAlJCv2piaxu1HmQlVokQQuiyA8w7ot5QnoO3AAAAAElFTkSuQmCC); float: right; width: 26px; height: 36px; background-repeat: no-repeat; background-size: 18px; margin: 10px 0 0 6px; }");
injectCss(".chrmbtn-search { width: 480px !important; left: 0px !important; }");