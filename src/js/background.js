/*
 * Seek 'n Play is an application developed by Circularify
 */

 // WebRequest Listener
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {

		// Whilst using the HTML5 player, do:
		if (details.url.indexOf('html5player') > -1) {
		
			// Let, just, me, get that YT API JavaScript file
			var xhr = new XMLHttpRequest();
			xhr.open("GET", details.url, false);
			xhr.send();
			var resp = xhr.responseText;
			
			// Makes sure that YT doens't restart buffering when we navigate to the video we're watching
			resp = resp.replace(/([A-Za-z]{1,3}\(this\,\"loadVideoByPlayerVars\"\,)(this\.[A-Za-z]{1,3})(\)\;)/, "$1 function (obj) { if (typeof (YTSPPreventRequeue) != \"function\" || YTSPPreventRequeue(obj.video_id)) { $2.apply(this, arguments); } } $3");
			// Matches: this.j&&this.A&&this.ha.pauseVideo()
			// Disable the pauseVideo function that the advertisers call so that the original video can get loaded
			resp = resp.replace(/(this\.[a-zA-Z]{1,2}&&this\.[a-zA-Z]{1,2}&&this\.[a-zA-Z]{1,3}\.)(pauseVideo\(\))/, "$1YTSNP$2");
			// Matches: function H(a,b){this.width=a;this.height=b}
			// Solves the ad container so that the skip button is visible in the corner
			resp = resp.replace(/(function [a-zA-Z]{1,2}\(a\,b\)\{)(this.width=a;this.height=b\})/, "$1if(window.YTSNPIsCorner){a='480';b='300';}$2");
			// Matches: function oh(a,b,c){if(b instanceof H)c=b.height,b=b.width;else if(void 0==c)throw Error("missing height argument");
			// Makes sure that the video is always of the size of the player
			resp = resp.replace(/(function [a-zA-Z]{1,2}\(a\,b\,c\)\{if\(b instanceof [a-zA-Z]{1,2}\)c=b.height,b=b.width\;else if\(void 0==c\)throw Error\(\"[\w\s]+"\)\;)/, "$1if(window.YTSNPIsCorner){c=300;b=480;}");
			
			// Remove the pauseVideo command from the API, so we can keep on playin'
			resp = resp.replace(/([A-Za-z]{1,3}\(this\,\")(pauseVideo\"\,this\.[A-Za-z]{1,}\)\;)/, '$1YTSNP$2');
			
			// Remove the stopVideo command from the API, so we can keep on playin'
			var result = resp.replace(/[A-Za-z]{1,3}\(this\,\"stopVideo\"\,this\.[A-Za-z]{1,3}\)\;/, '');
			
			// Let's nicely return the JavaScript so that YouTube can access it
			return {redirectUrl: "data:application/javascript," + encodeURIComponent(result) };
		}
		
		// Fix for navigation
		if (details.url.indexOf("spf") > -1) {
		
			var xhr = new XMLHttpRequest();
			xhr.open("GET", details.url, false);
			xhr.send();
			var resp = xhr.responseText;
	
			// Look for pattern -- Dynamically called
			var regex2 = new RegExp(/(function [a-zA-Z]\([a-zA-Z]\)\{var [a-zA-Z]\=new [a-zA-Z]{2};)/);
	
			// Our own function
			var replaceString = '$1 if (typeof (window.YTSPNavigating) == "function") {try{window.YTSPNavigating();}catch(error){}}';
						
			// Add our own code and return
			var result = resp.replace(regex2, replaceString); 

			return {redirectUrl: "data:application/javascript," + encodeURIComponent(result) };
		}
	}
	, 
	{ urls: ["*://*.ytimg.com/*"]},
	["blocking"]
);

// Install listener
chrome.runtime.onInstalled.addListener(function(details){
	chrome.storage.sync.get('settings', function (container) {
		if (( !container || !container.settings ) || ( container.settings && !container.settings["hide-welcome"] ))
			// Open welcome file
			chrome.tabs.create({'url': chrome.extension.getURL('html/welcome/index.html')});
	});
});