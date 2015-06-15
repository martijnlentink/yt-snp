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
			
			// Set up regular expression that I will match on
			var regex = new RegExp(/[A-Za-z]{1,3}\(this\,\"stopVideo\"\,this\.[A-Za-z]{1,3}\)\;/);
			regex.multiline = true;
			var resp = xhr.responseText;
			
			var regex1 = new RegExp(/[A-Za-z]{1,3}\(this\,\"pauseVideo\"\,this\.[A-Za-z]{1,}\)\;/);
			regex.multiline = true;
			var resp = resp.replace(regex1, '');
			
			var secondRegex = new RegExp(/([A-Za-z]{1,3}\(this\,\"loadVideoByPlayerVars\"\,)(this\.[A-Za-z]{1,3})(\)\;)/);
			secondRegex.multiline = true;
			
			resp = resp.replace(secondRegex, "$1 function (obj) { if (typeof (YTSPPreventRequeue) != \"function\" || YTSPPreventRequeue(obj.video_id)) { $2.apply(this, arguments); } } $3");
			
			// Remove the stopVideo command from the API, so we can keep on playin'
			var result = resp.replace(regex, '');
			
			// Let's nicely return the JavaScript so that YouTube can access it
			return {redirectUrl: "data:application/javascript," + encodeURIComponent(result) };
		}
		
		// Fix for navigation
		if (details.url.indexOf("spf") > -1) {
		
			var xhr = new XMLHttpRequest();
			xhr.open("GET", details.url, false);
			xhr.send();
			var resp = xhr.responseText;
			
			// Look for pattern -- Clicking link
			var regex = new RegExp(/(\:a\.preventDefault\(\)\))/);
			regex.multiline = true;
			
			// Look for pattern -- Dynamically called
			var regex2 = new RegExp(/(function [a-zA-Z]\([a-zA-Z]\)\{var [a-zA-Z]\=new [a-zA-Z]{2};)/);
			regex2.multiline = true;
	
			// Our own function
			var replaceString = '$1 if (typeof (window.YTSPNavigating) == "function") {window.YTSPNavigating();}';
						
			// Add our own code and return
			var	result = resp.replace(regex2, replaceString); 

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