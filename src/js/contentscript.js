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
	var _url = window.location.href;
	
	// Every navigation we get notified by SPF what the new URL is
	window.addEventListener("spfrequest", _spfrequest);
	window.addEventListener("yt-navigate-finish", _spfrequest);

	// Singles if snp is ready on the page
	window.addEventListener("circReady", _circReady);
	window.addEventListener("scroll", _outOfView);

	function _spfrequest(event) {
		var bc =document.querySelector('.ytd-page-manager #contents ytd-item-section-renderer');
		if (bc)
			bc.parentNode.removeChild(bc);
		
		if (event.detail) {
			var url = event.detail.url || event.detail.response.url;
			if (url.indexOf("://") === -1)
				url = "https://youtube.com" + url;
			_url = url;
		}
			
		_navigateForward();
	}

	var oldFire = Polymer.Base.fire;
	Polymer.Base.fire = function (ev) { console.log(ev);
	if (ev === 'yt-player-requested' && circularify.ytsnp.shouldCornerize())
		return new CustomEvent('fake');
	// if (ev === 'yt-player-updated')
	// 	debugger;
	return oldFire.apply(this, arguments);
	};

	function _navigateForward(url) {
		// Get the URL
		url = url || _url || window.location.href;
		console.log(url);

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

	var _isCornerizedOov = null;
	function _outOfView() {
		var target = document.getElementById("theater-background") || document.querySelector("h1.title");

		if (target && _url.indexOf("watch?") > -1) {
			var elementRect = target.getBoundingClientRect();
			if (_isCornerizedOov == elementRect.bottom < 0)
				return;

			if (circularify && circularify.ytsnp) {
				if (elementRect.bottom < 0) {
					circularify.ytsnp.cornerize(false);
				}
				else {
					circularify.ytsnp.decornerize();
				}	
			}

			_isCornerizedOov = elementRect.bottom < 0;
		}
	}

	document.addEventListener("webkitfullscreenchange", function(event) {
	    if (document.webkitFullscreenEnabled && document.webkitFullscreenElement && document.webkitFullscreenElement.classList.contains("html5-video-player")) {
	        circularify.ytsnp.decornerize();
	    }
	    else
	    {
	    	if (circularify.ytsnp.shouldCornerize(document.location.href)) {
				circularify.ytsnp.cornerize();
			}
	    }
	});
	
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
		return video_id != circularify.ytapi.getPlayer().getVideoData().video_id;
	};

	function _circReady() {
		window.removeEventListener(circularify.core.events.circReady, this);
		// Navigating function
		window.YTSPPreventRequeue = _doesVideoIdMatchCurrent;
	}
	
	window.yttrcooldown = 0;
});

