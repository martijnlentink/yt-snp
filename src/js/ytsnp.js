/**
 * Seek 'n Play is an application developed by Circularify
 */

// YTSNP Object
function ytsnp() {

	_nativeSupported = !!document.pictureInPictureEnabled;

	var videoSize = {
		width: null,
		height: null,
		left: "0px",
		top: "0px",
		smallWidth: "480px",
		smallHeight: "270px"
	}
	
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

	function _forceResize() {
		window.dispatchEvent(new Event("resize"));
	}
	
	// Put the element in the corner
	function _cornerize(showButtons) {

		if (_nativeSupported) {
			circularify.omni.background.requestPip();
			//eval('let vidEl = document.querySelector("video"); vidEl.requestPictureInPicture();');
			return;
		}

		showButtons = typeof showButtons !== 'undefined' ? showButtons : true;	
		var element = circularify.ytapi.getVideoElement();
		// The player is cornerized
		window.YTSNPIsCorner = true;
		
		var player = _getPlayer();
		
		// Check if the player exists
		if(player) {
			// And if it exists, make sure we don't show an empty video.
			if(player.getPlaybackQuality() !== "unknown" && player.getPlaybackQuality() !== "undefined") {

				// GA
				if(window.yttrcooldown == 0) {
					circularify.omni.snp.analytics.registerEvent("Action", "Cornerize");
					window.yttrcooldown = 1;
					setTimeout(function() {
						window.yttrcooldown = 0;
					}, 1500);
				}

				var polymer = document.getElementsByTagName("ytd-watch");
				if (polymer.length > 0) {
					if (_shouldCornerize()) {
						polymer = polymer[0];
						polymer.removeAttribute("hidden");
						polymer.style.visibility = 'collapse';
						polymer.style.position = 'absolute';
					}

					element = document.getElementById("movie_player");
					element.style.visibility = 'visible';
				}
				else if (element && element.firstChild && element.firstChild.style)
					element.firstChild.style.display = "block";

				// Player sizing and positioning
				element.style.width = videoSize.smallWidth
				element.style.height = videoSize.smallHeight;
				element.style.right = "10px";
				element.style.position = "fixed";
				element.style.zIndex = "999";
				element.style.left = 'inherit';
				// Positioned on bottoms
				element.style.bottom = "10px";
				
				var advertisements = document.getElementsByClassName("ima-container autoalign");
				if (advertisements.length > 0) {
					advertisements[0].style.width = "auto !important";
				}
				var ad = document.getElementsByClassName("ad-overlay");
				if (ad.length > 0)
					ad[0].style.transform = "scale(.8)";
				
				// We're searching, so add the buttons (close & back)
				if (showButtons)
					_displayButtons();
				_forceResize();
			}
		}
	}
	
	// Removes the player from the corner and resets player size
	function _decornerize() {

		if (_nativeSupported && document.pictureInPictureElement) {
			pictureInPictureElement.exitPictureInPicture();
			return;
		}

		var element = circularify.ytapi.getVideoElement();
		// The player is no longer cornerized
		window.YTSNPIsCorner = false;
		var polymer = document.getElementsByTagName("ytd-watch");
		if (polymer.length > 0) {
			polymer = polymer[0];
			polymer.style.visibility = '';
			polymer.style.position = '';
			element = document.getElementById("movie_player");
		}
		element.removeAttribute("style");
		
		// GA
		if(window.yttrcooldown == 0) {
			circularify.omni.snp.analytics.registerEvent("Action", "Decornerize");
			window.yttrcooldown = 1;
			setTimeout(function() {
				window.yttrcooldown = 0;
			}, 1500);
		}
		
		_hideButtons();
		_forceResize();
	}
	
	// Perform an spf navigation and inform the player
	function _performNavigation(url) {
		spf.navigate(url);
	}
	
	
	/* Player Options */
	
	let _buttonsAdded = false;
	// Function to add the close & back buttons to the player
	function addButtons() {
		if (_buttonsAdded)
			return;

		let els = document.getElementsByClassName("ytp-chrome-controls");
		if (!els.length) {
			circularify.omni.snp.analytics.registerEvent("Error", "Player Controls Undefined");
			return;
		}
		let el = els[0];
	
		// Inject close button code in YouTube player
		var button = document.createElement('button');
		button.className = 'ytp-button closeButton';
		button.setAttribute('role', 'button');
		button.setAttribute('aria-label', 'Close player');
		button.setAttribute('tabindex', '6240');
		button.style.display = 'none';
		el.appendChild(button);
		
		// Add an eventlistener on event 'click', so we can handle the closing
		button.addEventListener('click', function (event) {
			var playel = document.getElementById('movie_player');
			playel.removeAttribute("style");			
 			playel.childNodes[0].childNodes[0].removeAttribute("style");
			circularify.debug.log(playel);
			var player = _getPlayer();
			player.cueVideoById();
			_hideButtons();
		});
		
		// Inject back to video button code in YouTube player
		button = document.createElement('button');
		button.className = 'ytp-button backToVideoButton';
		button.setAttribute('role', 'button');
		button.setAttribute('aria-label', 'Back to video');
		button.setAttribute('tabindex', '6241');
		button.style.display = 'none';
		el.appendChild(button);
		
		// Add an eventlistener on event 'click', so we can handle the closing
		button.addEventListener('click', function (event) {
			var url = _getPlayer().getVideoUrl();
			_performNavigation(url);
			_hideButtons();
		});

		_buttonsAdded = true;
	}
	
	
	// Function to add buttons to the page
	function _displayButtons() {
		var closeButton;
		var backButton;
		var sizeButton;
		addButtons();
		
		circularify.utils.wait(function () { return (closeButton = document.getElementsByClassName("closeButton")[0]) && (backButton = document.getElementsByClassName("backToVideoButton")[0]) && (sizeButton = document.getElementsByClassName('ytp-size-button ytp-button')[0]); }, function () {
			
			closeButton.style.display = 'block';
			backButton.style.display = 'block';
			sizeButton.style.display = 'none';
		});		
	}
	
	// Function to remove buttons from the page
	function _hideButtons() {
		var closeButton;
		var backButton;
		var sizeButton;
		addButtons();
		
		circularify.utils.wait(function () { return (closeButton = document.getElementsByClassName("closeButton")[0]) && (backButton = document.getElementsByClassName("backToVideoButton")[0]) && (sizeButton = document.getElementsByClassName('ytp-size-button ytp-button')[0]); }, function () {
			closeButton.style.display = 'none';
			backButton.style.display = 'none';
			sizeButton.style.display = '';
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