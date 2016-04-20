/**
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

	function _forceResize() {
		window.dispatchEvent(new Event("resize"));
	}
	
	// Put the element in the corner
	function _cornerize() {		
		
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
					circularify.omni.snp.analytics.registerEvent('Seek \'n Play cornerize', 'Seek \'n Play Cornerize');
					window.yttrcooldown = 1;
					setTimeout(function() {
						window.yttrcooldown = 0;
					}, 1500);
				}
			
				// // Make sure the player is visible and not somewhere far to the left
				// //element.className = element.className.replace(/\off-screen-target\b/,'');
				element.firstChild.style.display = "block";

				// Player sizing and positioning
				element.style.width = videoSize.smallWidth
				element.style.height = videoSize.smallHeight;
				element.style.right = "10px";
				element.style.position = "fixed";
				element.style.zIndex = "999";
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
				_displayButtons();
				_forceResize();
			}
		}
	}
	
	// Removes the player from the corner and resets player size
	function _decornerize() {

		var element = circularify.ytapi.getVideoElement();
		// The player is no longer cornerized
		window.YTSNPIsCorner = false;
		element.removeAttribute("style");
		
		// GA
		if(window.yttrcooldown == 0) {
			circularify.omni.snp.analytics.registerEvent('Seek \'n Play decornerize', 'Seek \'n Play Decornerize');
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
	
	// Function to add the close & back buttons to the player
	function addButtons() {
	
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
			var playel = document.getElementById('player-api');
			playel.removeAttribute("style");
			//playel.childNodes[0].childNodes[0].removeAttribute("style");
			playel.childNodes[0].childNodes[1].removeAttribute("style");
			console.info(playel);
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