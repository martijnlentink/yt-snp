/*
 * Seek 'n Play is an application developed by Circularify
 */
 
var lastNotificationCheck = Date.now();
var interval = 60 * 60 * 1000;
var lastHandledNotification = -1;

 // WebRequest Listener
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		if (Date.now() - lastNotificationCheck >= interval)
		{
			lastnotificationcheck = date.now();
			checkNotifications();
		}
	
		// Whilst using the HTML5 player, do:
		if (details.url.match(/player.*\/base\.js/)) {
		
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
			resp = resp.replace(/(function [a-zA-Z]{1,2}\(a\,b\)\{)(this.width=a;this.height=b\})/, "$1if(window.YTSNPIsCorner){a='480';b='270';}$2");
			// Matches: function oh(a,b,c){if(b instanceof H)c=b.height,b=b.width;else if(void 0==c)throw Error("missing height argument");
			// Makes sure that the video is always of the size of the player
			resp = resp.replace(/(function [a-zA-Z]{1,2}\(a\,b\,c\)\{if\(b instanceof [a-zA-Z]{1,2}\)c=b.height,b=b.width\;else if\(void 0==c\)throw Error\(\"[\w\s]+"\)\;)/, "$1if(window.YTSNPIsCorner){c=270;b=480;}");
			
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

	// i18n install message
	var installMsg = chrome.i18n.getMessage("installNotification");

	// SHOW INSTALL POPUP
	chrome.notifications.create("9310", {
		type: 'basic',
		iconUrl: chrome.extension.getURL('img/icon.128.png'),
		title: 'Seek \'n Play',
		message: installMsg
	}, null);
	
	circularify.omni.analytics.registerEvent("install", details.reason, details.previousVersion);
});

// Add Event Listener for Notifications
chrome.notifications.onClicked.addListener(function(notificationId) {

	// #SNP Update Notifications
	if(notificationId == "9310") {
	
		// Get version number and replace '.' with '-'
		var vnr = chrome.app.getDetails().version.replace(/\./g, '-');
	
		// Navigate to our website
		chrome.tabs.create({'url': 'http://circularify.com/release/snp/' + vnr });
	
	}
});

function showNotification(id, message, title, iconUrl, type)
{
	title = title || 'Seek \'n Play';
	iconUrl = iconUrl || 'img/icon.128.png';
	if (!iconUrl.indexOf("://"))
		iconUrl = chrome.extension.getURL(iconUrl);
	type = type || 'basic';
	
	chrome.notifications.create(id, {
		type: type,
		iconUrl: iconUrl,
		title: title,
		message: message
	}, null);
}

function checkNotifications()
{
	// We're doing a HttpRequest looking for new notifications
	// We'll pass the last notification that we showed in order
	// to get the remaining notifications
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "http://circularify.com/notifyAPI/" + lastHandledNotification);
	xhr.addEventListener("load", handleNotification);
	xhr.send();
}

function handleNotification()
{
	var array = JSON.parse(this.responseText);
	
	if (array.length > 0)
	{
		// We'll now be showing notification(s)
		// TODO: Determine what to do when we got multiple notifications to show
		for (var i in array)
		{
			var notification = array[i];
			showNotification(notification.id, notification.message, notification.title);
			circularify.omni.analytics.registerEvent("displayed_notification", notification.id);
		}
	}
}