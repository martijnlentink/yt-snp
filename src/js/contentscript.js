/**
 * Seek 'n Play is an application developed by Circularify
 */
 
circularify.omni.analytics.initialize('UA-50232941-1');
circularify.omni.page.injectScript(circularify.core.files.ytapi);
circularify.omni.page.injectScript('js/ytsnp.js');
circularify.omni.page.injectCss('css/ytsnp.css');

// Add SNP to the Circularify list of installed extension
circularify.omni.register("snp");

circularify.settings.listen("floatingPlayerEnabled", function (newValue) {
	circularify.debug.log("floatingPlayerEnabled changed");
	circularify.omni.page.injectScript(function (newValue) {
		// Fix for now to check if the value is really truthy
		newValue = newValue === "true";
		document.ytSnpEnabled = newValue;
		if (newValue) {
			if (circularify.ytsnp.shouldCornerize(window.location.href)) {
				circularify.ytsnp.cornerize();
			}
		}
		else
			circularify.ytsnp.decornerize();
	}, newValue);
});
 
// Main method.
circularify.settings.get("floatingPlayerEnabled", true, function (floatingPlayerEnabled) {
	circularify.omni.page.injectScript(function (floatingPlayerEnabled) {
		// Next URL
		var _url = window.location.href;
		document.ytSnpEnabled = floatingPlayerEnabled === "true";
		
		// Subscribe to the popstate event to handle going back in history
		//window.addEventListener("popstate", _navigateBackward);
		// Every navigation we get notified by SPF what the new URL is
		window.addEventListener("spfrequest", _spfrequest);
		document.addEventListener("yt-navigate-finish", _spfrequest);

		(function(send, open, setHeader) {

			XMLHttpRequest.prototype.setRequestHeader = function (header, val) {
				this._headers = this._headers || {};

				this._headers[header] = val;

				return setHeader.apply(this, arguments);
			}

			 XMLHttpRequest.prototype.open = function (method, url) {
			    this._url = url;
			    return open.apply(this, arguments);
			};

		    XMLHttpRequest.prototype.send = function(data) {
		        if (this._headers && this._headers['X-SPF-Referer'] && this._headers['X-SPF-Previous'] !== document.location.href)
		       		_spfrequest({ detail: { url: this._url }});

		        return send.apply(this, arguments);
		    };

		})(XMLHttpRequest.prototype.send, XMLHttpRequest.prototype.open, XMLHttpRequest.prototype.setRequestHeader);

		// Singles if snp is ready on the page
		window.addEventListener("circReady", _circReady);
		window.addEventListener("scroll", _outOfView);

		function _spfrequest(event) {
			try {
				if (event.detail)
					_url = event.detail.url || event.detail.response.url;

				circularify.omni.snp.analytics.trackPage(_url);
			}
			catch (error) {	console.warn(error);	}
			_navigateForward();
		}

		// Function that handles a navigation going back in history
		function _navigateBackward(event) {
			var url = _url;
			if (circularify.ytsnp.shouldCornerize(url) && document.ytSnpEnabled) {
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
					if (circularify.ytsnp.shouldCornerize(url) && document.ytSnpEnabled) {
										
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
					if (elementRect.bottom < 0 && document.ytSnpEnabled) {
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
		    	if (circularify.ytsnp.shouldCornerize(document.location.href) && document.ytSnpEnabled) {
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
	}, floatingPlayerEnabled);
});
