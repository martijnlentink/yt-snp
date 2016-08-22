/*
 * Seek 'n Play is an application developed by Circularify
 */

var sourceReplacement = function (name, regex, replacement) {
	var _name = name;
	var _regex = regex;
	var _replacement = replacement;

	var _performReplace = function(source) {
		if (source.search(_regex) == -1)
			circularify.omni.analytics.registerEvent("regex-error-" + _name);
		else
			return source.replace(_regex, _replacement);
		return source;
	}

	return {
		name: _name,
		regex: _regex,
		replacement: _replacement,
		performReplace: _performReplace
	};
}
 
var lastNotificationCheck = Date.now();
var interval = 60 * 60 * 1000;
var lastHandledNotification = -1;

 // WebRequest Listener
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
	// Remove false when we're using this again!
		if (false && Date.now() - lastNotificationCheck >= interval)
		{
			lastnotificationcheck = Date.now();
			checkNotifications();
		}
	
		// Whilst using the HTML5 player, do:
		if (details.url.match(/player.*\/base\.js/)) {
		
			// Let, just, me, get that YT API JavaScript file
			var xhr = new XMLHttpRequest();
			xhr.open("GET", details.url, false);
			xhr.send();
			var resp = xhr.responseText;

			var regexs = [
				// Makes sure that YT doens't restart buffering when we navigate to the video we're watching
				new sourceReplacement("requeue-prevention",
					/([A-Za-z]{1,3}\(this\,\"loadVideoByPlayerVars\"\,)(this\.[A-Za-z]{1,3})(\)\;)/,
					"$1 function (obj) { if (typeof (YTSPPreventRequeue) != \"function\" || YTSPPreventRequeue(obj.video_id)) { $2.apply(this, arguments); } } $3"
				),
				// Disable the pauseVideo function that the advertisers call so that the original video can get loaded
				// Matches: this.j&&this.A&&this.ha.pauseVideo()
				new sourceReplacement("enable-advertisements-pause",
					/(this\.[a-zA-Z]{1,2}&&this\.[a-zA-Z]{1,2}&&this\.[a-zA-Z]{1,3}\.)(pauseVideo\(\))/,
					"$1YTSNP$2"
				),
				// Remove the pauseVideo command from the API, so we can keep on playin'
				new sourceReplacement("disable-pause",
					/([A-Za-z]{1,3}\(this\,\")(pauseVideo\"\,this\.[A-Za-z]{1,}\)\;)/,
					'$1YTSNP$2'
				),//var a=this.app.W(),b=xh()==this.element;if(b&&Ht())return new ve(window.outerWidth,window.outerHeight);
				// We need a reference to this class to update the size of the window
				// Matches: h.Ja=function(){var a=this.app.V,b=Jh()==this.element;if(b&&rq())return new Xe(window.outerWidth,window.outerHeight);
				new sourceReplacement("update-window-size",
					/([a-z]\.[a-zA-Z]{2,3}=function\(\)\{var a=this\.app\.[a-zA-Z]{1,2}.+?;if\(.+?)(\)return new ([^(]+)[^;]+)/,
					"$1 || (!!window.YTSNPIsCorner && b)$2;if (!!window.YTSNPIsCorner) { return new $3(480,270);}"
				),
				// Remove the stopVideo command from the API, so we can keep on playin'
				new sourceReplacement("disable-stop",
					/[A-Za-z]{1,3}\(this\,\"stopVideo\"\,this\.[A-Za-z@$%&*]{1,3}\)\;/,
					''
				)
			];

			for (var idx in regexs) {
				var currentRegex = regexs[idx];
				resp = currentRegex.performReplace(resp);
			}
			
			// Let's nicely return the JavaScript so that YouTube can access it
			return {redirectUrl: "data:application/javascript," + encodeURIComponent(resp) };
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
	
	circularify.omni.analytics.registerEvent(details.reason, chrome.runtime.getManifest().version);
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
	xhr.open("GET", "http://circularify.com/notify/" + lastHandledNotification);
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

/* SNP-APP */
var prevTab = 0;
var currentTab = 0;
var prevUrl = '';
var currentUrl = '';
chrome.tabs.onActivated.addListener(function (info) {
	chrome.tabs.get(info.tabId, function (tab) {
			_updateApp(tab.url, info.tabId);
	});
});

// chrome.permissions.request({
// 	  permissions: ['management'],
// 	  origins: ['*://*.youtube.com/*']
// 	}, function(granted) {
//     	if (granted)
//     	{
// 			chrome.management.launchApp("mgflnabaldboiahifonjgnoodgnccefm");
//     	}
//     }
// );
// var currentTime = 0;
// var tabList = [];
// var currentTab = 0;
// var previousTab = 0;

// /* Create a list of all the tabs that are open */
// chrome.tabs.query({ windowType: "normal" }, function (tabs) {
// 	tabList = tabs;
	
// 	for (i = 0; i < tabList.length; i++)
// 	{
// 		if (tabList[i].active)
// 		{
// 			currentTab = tabList[i].id;
// 			break;
// 		}
// 	}
// });

function _updateApp(newUrl, newTabId) {
	prevUrl = currentUrl;
	currentUrl = newUrl;

	prevTab = currentTab;
	currentTab = newTabId;

	if (prevUrl.indexOf('watch?v=') > -1 && currentUrl.indexOf('watch?v=') == -1)
	{
		circularify.app.cueVideoByUrl(prevUrl);
		chrome.tabs.executeScript(prevTab, {code: 'circularify.omni.page.injectScript(function () {circularify.ytapi.getPlayer().mute()});'});
		chrome.tabs.executeScript(prevTab, {code: 'document.querySelector(".ytp-progress-bar[aria-valuenow]").getAttribute("aria-valuenow");'}, function (result) {
			circularify.app.seekTo(result);
		});
		circularify.app.playVideo();
		circularify.app.unMute();
	}
	if (currentUrl.indexOf('watch?v=') > -1)
	{
		circularify.app.getVideoId(function (id) {
			if (currentUrl.indexOf(id) > -1)
				circularify.app.getCurrentTime(function (time) {
					chrome.tabs.executeScript(currentTab, {code: 'circularify.omni.page.injectScript(function () {circularify.ytapi.getPlayer().seekTo('+time+');circularify.ytapi.getPlayer().unMute();});'});
				});
		});
		circularify.app.mute();
	}
}

// /* Because chrome.tabs.OnBeforeUpdated does not exist we mimic it by watching the requests */
// chrome.webRequest.onBeforeRequest.addListener(
// 	function(details) {
// 		_updateApp(details.url);
// 	},
// 	{ urls: ["<all_urls>"], types: ["main_frame"] }
// );

// chrome.tabs.query({'active': true}, function (activeTabs) {
        // chrome.tabs.connect(activeTabs[0].tabId,{name: "time-listener"});
// });

// chrome.runtime.onMessage.addListener(
  // function(request, sender, sendResponse) {
    // currentTime = request.time;
  // });
  
// chrome.runtime.onConnect.addListener(function (port) {
// 	port.onMessage.addListener(function (request) {
// 		currentTime = request.time;
// 	});
// });

// chrome.tabs.onActivated.addListener(function(activeInfo) {
// 	chrome.permissions.request({
//           permissions: ['tabs']
//         });
//     chrome.tabs.get(activeInfo.tabId, function (tab) {
//         mySuperCallback(activeInfo.tabId, tab.url);
//     });
// });

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
    chrome.tabs.query({'active': true}, function (activeTabs) {
        var activeTab = activeTabs[0];

        if (activeTab.id == updatedTab.id) {
			_updateApp(activeTab.url, tabId);
        }
   });
});

