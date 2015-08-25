/*
 * Seek 'n Play is an application developed by Circularify
 */

// YTSNP Object
function ytsnp() {

	var videoSize = {
		width: null,
		height: null,
		left: "0px",
		top: "0px",
		smallWidth: "480px",
		smallHeight: "270px"
	}
	
	// Reference the player object using a 'wait' call.
	var el;
	circularify.utils.wait(function() { return (el = document.getElementsByClassName("ytp-chrome-controls")[0]);}, addButtons);	
	
	// Get a reference job
	function _getPlayer() {
		return circularify.ytapi.getPlayer();
	}		

	/* Cornering handle */

	
	// Checks wether the player should go in the corner
	function _shouldCornerize(location) {
		location = location || window.location.href;
		return !location.match(/\/watch\?.*v=.{8,}/);
	}
	
	// Put the element in the corner
	function _cornerize(element) {		
		
		// The player is cornerized
		window.YTSNPIsCorner = true;
		
		var player = _getPlayer();
		
		// Check if the player exists
		if(player) {
			// And if it exists, make sure we don't show an empty video.
			if(player.getPlaybackQuality() !== "unknown" && player.getPlaybackQuality() !== "undefined") {

				// Make sure the player is visible and not somewhere far to the left
				//element.className = element.className.replace(/\off-screen-target\b/,'');
				element.firstChild.style.display = "block";

				// Player sizing and positioning
				element.style.width = videoSize.smallWidth
				element.style.height = videoSize.smallHeight;
				element.style.right = "10px";
				element.style.position = "fixed";
				element.style.zIndex = "999";
				
				var advertisements = document.getElementsByClassName("container autoalign");
				if (advertisements.length > 0) {
					advertisements[0].style.width = "auto";
				}

				var videoAdvertisements = document.getElementsByClassName("ad-container ad-container-single-media-element-annotations");
				if (videoAdvertisements.length > 0) {
					videoAdvertisements[0].style.width = videoSize.smallWidth;
					videoAdvertisements[0].style.height = videoSize.smallHeight;
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
				var settings = window.getSettings();
				if(settings && settings.position == "top") { // Positioned on top
					element.style.top = "70px";
				} else {						// Positioned on bottoms
					element.style.bottom = "10px";
				}
				
				// Making sure the video scales when cornerizing
				var video = document.getElementsByClassName("html5-main-video");
				
				var saveWidth = video[0].style.width;
				var saveHeight = video[0].style.height;
				
				if(saveWidth != videoSize.smallWidth 
					&& saveHeight != videoSize.smallHeight) {
					
					videoSize.width = saveWidth;
					videoSize.height = saveHeight;
				}
				
				video[0].style.width = videoSize.smallWidth;
				video[0].style.height = videoSize.smallHeight;
				video[0].style.top = "0px";
				video[0].style.left = "0px";

				var container = document.getElementsByClassName("ytp-chrome-bottom")[0];
				container.className = "ytp-chrome-bottom chrmbtn-search";
				
				// We're searching, so add the buttons (close & back)
				_displayButtons();
			}
		}
	}
	
	// Removes the player from the corner and resets player size
	function _decornerize(element) {
		// The player is no longer cornerized
		window.YTSNPIsCorner = false;
		element.removeAttribute("style");
		
		if (videoSize.width != null && videoSize.height != null)
		{
			var videoElement = document.getElementsByClassName("html5-main-video")[0];
			videoElement.style.width = videoSize.width;
			videoElement.style.height = videoSize.height;
			videoElement.style.top = videoSize.top;
			videoElement.style.left = videoSize.left;
		}
		
		var skipAdContainer = document.getElementsByClassName("videoAdUiPreSkipContainer");
		if (skipAdContainer.length > 0)
			skipAdContainer[0].removeAttribute("style");
		var skipAdButton = document.getElementsByClassName("videoAdUiSkipContainer html5-stop-propagation");
		if (skipAdButton.length > 0)
			skipAdButton[0].removeAttribute("style");
			
		var container = document.getElementsByClassName("ytp-chrome-bottom")[0];
			container.className = "ytp-chrome-bottom";	
		
		_hideButtons();
	}
	
	/* Player Options */
	
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
			playel.childNodes[0].childNodes[0].childNodes[0].removeAttribute("style");
			document.getElementsByClassName("html5-progress-bar ytp-force-transform")[0].removeAttribute("style");
			console.log(playel);
			var player = _getPlayer();
			player.cueVideoById();
			_hideButtons();
		});
		
		// Inject back to video button code in YouTube player
		button = document.createElement('div');
		button.className = 'ytp-button backToVideoButton';
		button.setAttribute('role', 'button');
		button.setAttribute('aria-label', 'Back to video');
		button.setAttribute('tabindex', '6241');
		button.style.display = 'none';
		el.appendChild(button);
		
		// Add an eventlistener on event 'click', so we can handle the closing
		button.addEventListener('click', function (event) {
			var url = _getPlayer().getVideoUrl();
			performNavigation(url);
			_hideButtons();
		});
	}
	
	
	// Function to add buttons to the page
	function _displayButtons() {
		var closeButton;
		var backButton;
		
		circularify.utils.wait(function () { return (closeButton = document.getElementsByClassName("closeButton")[0]) && (backButton = document.getElementsByClassName("backToVideoButton")[0]); }, function () {
			
			closeButton.style.display = 'block';
			backButton.style.display = 'block';
		});
	}
	
	// Function to remove buttons from the page
	function _hideButtons() {
		var closeButton;
		var backButton;
		
		circularify.utils.wait(function () { return (closeButton = document.getElementsByClassName("closeButton")[0]) && (backButton = document.getElementsByClassName("backToVideoButton")[0]); }, function () {
			closeButton.style.display = 'none';
			backButton.style.display = 'none';
		});
	}
	
	// Exposable Object
	return {
		shouldCornerize	: _shouldCornerize,
		cornerize		: _cornerize,
		decornerize		: _decornerize,
		displayButtons	: _displayButtons,
		hideButtons		: _hideButtons
	}
};


// Define or reference main object
var circularify = circularify || {};

// Add YTSNP object to main
circularify.ytsnp = circularify.ytsnp || ytsnp();
