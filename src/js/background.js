/*!
 * Seek 'n Play is an application developed by Circularify
 */
 /** @define {boolean} */
var CIRC_DEBUG = true;

// Debugging property.
circularify = circularify || {}
circularify.debugging = CIRC_DEBUG;

// GCM Configuration.
var registrationId;
var senderId = "88754012915";
let _externalTermination = null;

// Variables containing the last received notification id.
var receivedNotificationId = -1;
var receivedNotificationUrl = null;

let _enableDisableStrings = { true: "Disable Seek 'n Player", false: "Enable Seek 'n Player" };

/* Right click menu for disabling snp temporary */
circularify.settings.get("floatingPlayerEnabled", true, async function (floatingPlayerEnabled) {
	let _contextMenu = chrome.contextMenus.create({
		type: "normal",
		contexts: ["all"],
		title: _enableDisableStrings[floatingPlayerEnabled],
		documentUrlPatterns: ["*://*.youtube.com/*"],
		onclick: (info, tab) => {
			floatingPlayerEnabled = !floatingPlayerEnabled;
			circularify.settings.set("floatingPlayerEnabled", floatingPlayerEnabled);
			chrome.contextMenus.update(_contextMenu, { title: _enableDisableStrings[floatingPlayerEnabled] } );
		}
	});
});


let sourceReplacement = function (name, regex, replacement) {
	var _name = name;
	var _regex = regex;
	var _replacement = replacement;

	var _performReplace = function (source) {
		if (source.search(_regex) == -1)
			circularify.omni.analytics.registerEvent("Regex", "Regex-error-" + _name);
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
		if (_externalTermination)
			return;

		// Whilst using the HTML5 player, do:
		if (details.url.match(/player.*\/base\.js/)) {
			// Let, just, me, get that YT API JavaScript file
			var xhr = new XMLHttpRequest();
			xhr.open("GET", details.url, false);
			xhr.send();
			var resp = xhr.responseText;
			
			let regexs = [
				// Makes sure that YT doens't restart buffering when we navigate to the video we're watching
				// Matches: g.h.fD=function(a){a.getVideoData()&&this.updateVideoData(a.getVideoData())};
				new sourceReplacement("requeue-prevention",
					/\{(a.getVideoData\(.{0,6}\)\&\&)/,
					"{ if (typeof (YTSPPreventRequeue) == \"function\" && a && a.getVideoData() && YTSPPreventRequeue(a.getVideoData().videoId)) return;$1"
				),
				new sourceReplacement("", /(\.removeAttribute\(\")src("\))/,
					"$1$2"
				),
				// Disable the pauseVideo function that the advertisers call so that the original video can get loaded
				// Matches: this.j&&this.A&&this.ha.pauseVideo()
				new sourceReplacement("enable-advertisements-pause",
					/(this\.[a-zA-Z]{1,2}&&this\.[a-zA-Z]{1,2}&&this\.[a-zA-Z]{1,3}\.)(pauseVideo\(\))/,
					"$1YTSNP$2"
				),
				// We need a reference to this class to update the size of the window
				// Matches: g.h.getPlayerSize=function(){var a=this.app.g,b=this.app.P.isFullscreen();if(b&&Zq())return new g.Nd(window.outerWidth,window.outerHeight);if(b||a.yl){if(window.matchMedia){a="(width: "+window.innerWidth+"px) and (height: "+window.innerHeight+"px)";this.D&&this.D.media==a||(this.D=window.matchMedia(a));var c=this.D&&this.D.matches}if(c)return new g.Nd(window.innerWidth,window.innerHeight)}else{if(!isNaN(this.A.width)&&!isNaN(this.A.height))return this.A.clone();if(this.X&&this.Y&&!this.app.isWidescreen())for(a=
				new sourceReplacement("update-window-size",
					/(getPlayerSize=function\(\)\{.+?;if\(.+?)(\)return new ([^(]+)[^;]+)/,
					"$1 || (!!window.YTSNPIsCorner && b)$2;if (!!window.YTSNPIsCorner) { return new $3(window.YTSNPWidth || 480,window.YTSNPHeight || 270);}"
				),
				// Matches: g.h.stopVideo=function(){var a=this.l.getVideoData(),b=new g.VA(this.g,{video_id:a.Os||a.videoId,oauth_token:a.oauthToken});g.P(this.g.experiments,"html5_stopVideo_copy_thumbs_killswitch")||(b.pg=g.sc(a.pg));sX(this,b,1);null!=this.V&&this.V.stop()};
				new sourceReplacement("disable-stop-navigate-polymer",
					/([a-zA-Z]{3,4}=function\(a?\){)(.*?video\_id.*?oauth\_token.*?\.stop\(\))/,
					'$1return;$2'
				)
			];

			for (var idx in regexs) {
				var currentRegex = regexs[idx];
				resp = currentRegex.performReplace(resp);
			}

			// Apparently we have some problems injecting directly into Chrome
			// so we just create a script element with the content
			var code = encodeURIComponent("var script = document.createElement('script');	script.innerHTML = \"" + JSON.stringify(resp).slice(1, -1) + "\";document.head.appendChild(script);");

			// Let's nicely return the JavaScript so that YouTube can access it
			return { redirectUrl: "data:text/javascript," + code };
		}
	},
	{ urls: ["*://*.youtube.com/*", "*://*.ytimg.com/*"] },
	["blocking"]
);

function sleep(ms) {
    var unixtime_ms = new Date().getTime();
    while(new Date().getTime() < unixtime_ms + ms) {}
}

/*
	Install listener
*/
chrome.runtime.onInstalled.addListener(async function(details){

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
	setTimeout(function() {		
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
	
	let birthdayStartup = await circularify.settings.get("birthday-startup", false);
	// SHOW INSTALL PAGE (v3.0.x only)
	if (!birthdayStartup && circularify.utils.checkMinVersion("3.0.0")) {
		chrome.tabs.create({ "url": "html/startup.html"});
		circularify.settings.set("birthday-startup", true);
	}
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
		circularify.omni.analytics.registerEvent("Notification-Click", "Update-v" + vnr);

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
		circularify.omni.analytics.registerEvent("Notification-Click", "Donate");

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
		if (notification.hasAction !== "false") {
			if (notification.actionText === 'snp.Disable')
				_externalTermination = true;
			else if (notification.actionText === 'snp.Enable')
				_externalTermination = false;
			else
				chromeNotification.buttons = [{
					title: notification.actionText
				}]
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