/*
 * Seek 'n Play is an application developed by Circularify
 */

// Debugging property.
circularify = circularify || {}
circularify.debugging = false;

circularify.debug.toggle();

// GCM Configuration.
var registrationId;
var senderId = "88754012915";

// Variables containing the last received notification id.
var receivedNotificationId = -1;
var receivedNotificationUrl = null;

let sourceReplacement = function (name, regex, replacement) {
	var _name = name;
	var _regex = regex;
	var _replacement = replacement;

	var _performReplace = function (source) {
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

/*
	WebRequest Listener
*/
chrome.webRequest.onBeforeRequest.addListener(
	function (details) {

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
					/([A-Za-z]{1,3}\(this\,\"stopVideo\"\,)this\.[A-Za-z@$%&*]{1,3}\)\;/,
					'$1function(){});'
				),
				//stopPlayer_:function(){var a=this.getInterface(Ds).getPlayer();a&&5!=a.getPlayerState()&&a.stopVideo()}
				new sourceReplacement("disable-stop-polymer",
					/(stopPlayer\_.*?&&a.stopVideo)(\(\))/,
					'$1'
				)
			];

			for (var idx in regexs) {
				var currentRegex = regexs[idx];
				resp = currentRegex.performReplace(resp);
			}

			// Let's nicely return the JavaScript so that YouTube can access it
			return { redirectUrl: "data:application/javascript," + encodeURIComponent(resp) };
		}

		// Fix for navigation
		if (details.url.indexOf("spf.js") > -1) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", details.url, false);
			xhr.send();
			var resp = xhr.responsetext;

			// look for pattern -- dynamically called
			var regex2 = new regexp(/(function [a-za-z]\([a-za-z]\)\{var [a-za-z]\=new [a-za-z]{2};)/);

			// our own function
			var replacestring = '$1 if (typeof (window.ytspnavigating) == "function") {try{window.ytspnavigating();}catch(error){}}';

			// add our own code and return
			var result = resp.replace(regex2, replacestring);

			return { redirecturl: "data:application/javascript," + encodeuricomponent(result) };
		}

		// if (details.url.indexOf("desktop_polymer.js" > -1)) {
		// var xhr = new XMLHttpRequest();
		// xhr.open("GET", details.url, false);
		// xhr.send();
		// var resp = xhr.responseText;

		// var regexs = [ new sourceReplacement("fix-player-functions",
		// /for\(var ([a-z]) in ([a-z]).api\)\2.api\[\1\]=null;/,
		// ""
		// )];

		// for (var idx in regexs) {
		// var currentRegex = regexs[idx];
		// resp = currentRegex.performReplace(resp);
		// }

		// // Let's nicely return the JavaScript so that YouTube can access it
		// return {redirectUrl: "data:application/javascript," + encodeURIComponent(resp) };
		// }
	}
	,
	{ urls: ["*://*.youtube.com/*"] },
	["blocking"]
);

/*
	Install listener
*/
chrome.runtime.onInstalled.addListener(function (details) {

	// i18n install message
	var installMsg = chrome.i18n.getMessage("installNotification");

	// SHOW INSTALL POPUP
	chrome.notifications.create("9310", {
		type: 'basic',
		iconUrl: chrome.extension.getURL('img/icon.128.png'),
		title: 'Seek \'n Play',
		message: installMsg
	}, null);

	// i18n donate messages
	var donateMsg = chrome.i18n.getMessage("donateNotification");
	var donateBtnMsg = chrome.i18n.getMessage("donateNotificationButton");

	// SHOW DONATE POPUP
	setTimeout(function () {
		chrome.notifications.create("9999", {
			type: 'basic',
			iconUrl: chrome.extension.getURL('img/icon.128.png'),
			title: 'Seek \'n Play',
			message: donateMsg,
			buttons: [
				{
					title: donateBtnMsg,
					iconUrl: chrome.extension.getURL('img/paypal-logo.png')
				}
			]
		}, null);
	}, 500);

	circularify.omni.analytics.registerEvent(details.reason, chrome.runtime.getManifest().version);

	// SHOW INSTALL PAGE (v3.0.x only)
	chrome.tabs.create({ "url": "html/startup.html" });
});

/*
	Add Event Listener for Notifications.
*/
chrome.notifications.onClicked.addListener(function (notificationId) {

	// #SNP Update Notifications
	if (notificationId == "9310") {

		// Get version number and replace '.' with '-'
		var vnr = chrome.app.getDetails().version.replace(/\./g, '-');

		// Register with analytics.
		circularify.omni.analytics.registerEvent("notification-update-click-v" + vnr);

		// Navigate to our website
		chrome.tabs.create({ 'url': 'http://circularify.com/release/snp/' + vnr });
	}
});

/* 
	Add Event Listener for Notifications.
*/
chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {

	// #SNP Donate Button
	if (notificationId == "9999") {

		// Register with analytics.
		circularify.omni.analytics.registerEvent("notification-donate-click");

		// Navigate to the donate page.
		chrome.tabs.create({ 'url': 'http://paypal.me/ccircularify' });
	}

	// If a notification with action was received, act upon this notification.
	if (receivedNotificationId !== -1 && receivedNotificationUrl !== null) {

		// Check wether this was the notification that was received.
		if (notificationId === receivedNotificationId) {

			// Navigate to the URL that was sent with the received notification.
			chrome.tabs.create({ 'url': receivedNotificationUrl });
		}

		// Lastly, clear the variables.
		receivedNotificationId = -1;
		receivedNotificationUrl = null;
	}
});

/*
	Check wether the received notification should be shown.
*/
function shouldShowNotification(isProduction) {

	// Production messages should always be shown!
	if (isProduction === "true") {
		return true;
	}

	// If debugging is enabled, then always show any message.
	if (circularify.debugging == true) {
		return true;
	}

	// Default case: false.
	return false;
}

/*
	GCM Message Received Event Handler.
*/
function messageReceived(message) {

	circularify.debug.log('Received SnP push notification', message);

	// Retrieve the notification body.
	let notification = message.data;

	// Check wether the notification should be processed and shown.
	if (shouldShowNotification(notification.isProduction)) {

		// Create the Chrome notification object.
		let chromeNotification = {
			type: 'basic',
			iconUrl: chrome.extension.getURL('img/icon.128.png'),
			title: notification.title,
			message: notification.message
		};

		// if the notification has an action attached, show the action button.
		if (notification.hasAction !== false) {
			chromeNotification.buttons = [{
				title: notification.actionText
			}]

			// The notification has an action, store this information locally so if clicked on the notification, there can be acted upon.
			receivedNotificationId = notification.notificationId;
			receivedNotificationUrl = notification.actionUrl;
		}

		// Show the notification.
		chrome.notifications.create(notification.notificationId, chromeNotification, null);
	}
}

/*
	Method handling the first time registration to GCM.
*/
function firstTimeRegistration() {
	// Retrieve if the client is already registered.
	let isRegistered = window.localStorage.getItem("registered");

	// If the above result is undefined, the user is not yet registered.
	if (isRegistered === null) {

		// Register the client to GCM.
		chrome.gcm.register([senderId], registerCallback);
	}
}

/*
	Method handling the GCM registration callback.
*/
function registerCallback(regId) {

	// If an error occurred, log it.
	if (chrome.runtime.lastError) {
		circularify.debug.error('An error occurred while registering with GCM: ', chrome.runtime.lastError.message);
	} else {
		circularify.debug.info("Registered with GCM.");

		// Save the registration id locally.
		registrationId = regId;

		// Set that the client is registered.
		window.localStorage.setItem("registered", true);
	}
}

// Setup the listener.
chrome.gcm.onMessage.addListener(messageReceived);

// Register the client to the hub on installation, and on startup.
chrome.runtime.onInstalled.addListener(firstTimeRegistration);
chrome.runtime.onStartup.addListener(firstTimeRegistration);