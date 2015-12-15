/*
 * Seek 'n Play is an application developed by Circularify
 */
 
// Reference the required files 
var modulesJs = chrome.extension.getURL('js/core/modules.js');
var ytapiJs = chrome.extension.getURL('js/core/ytapi.js');
var ytsnpJs = chrome.extension.getURL('js/core/ytsnp.js');
var ytsnpCss = chrome.extension.getURL('css/ytsnp.css');
 
// Inject extension files
injectLf(modulesJs);
injectLf(ytapiJs);
injectLf(ytsnpJs);
injectCss(ytsnpCss);

// Main method.
inject(function () {
	
	// Subscribe to the popstate event to handle going back in history
	window.addEventListener("popstate", function () { navigateBackward(); });

	// Function that handles a navigation going back in history
	function navigateBackward(url) {
		if (circularify.ytsnp.shouldCornerize(url)) {
			circularify.ytsnp.cornerize();
		}
		else {
			circularify.ytapi.restoreTime();
			circularify.ytsnp.decornerize();
		}
	}
	
	function navigateForward(url) {		
		// Get the URL
		url = url || window.location.href;
	
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
		if(circularify) {
			window.YTSPNavigating = circularify.mailoffice.sendMailman;
			circularify.mailoffice.subscribe(navigateForward);
			clearTimeout(this);
		}
	}, 1000);
		
		
	window.yttrcooldown = 0;
});

// Inject GA
inject(function(){
	
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','https://www.google-analytics.com/analytics.js','yttr');
	yttr('create', 'UA-50232941-1', 'auto');
})

// Inject linked file
function injectLf(fn) {
	var script = document.createElement('script');
	script.src = fn;
	document.head.appendChild(script);
}

function injectCss(fn) {
	var script = document.createElement('link');
	script.href = fn;
	script.rel = "stylesheet";
	document.head.appendChild(script);
}

// Inject function
function inject(fn) {
	var script = document.createElement('script');
	script.innerHTML = '(' + fn.toString() + ')();';
	document.body.appendChild(script);
}