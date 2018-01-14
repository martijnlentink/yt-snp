/*
 * Seek 'n Play is an application developed by Circularify
 */

var registrationId;
var senderId = "88754012915";

var sourceReplacement = function (name, regex, replacement) {
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

// WebRequest Listener
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

// Install listener
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
					iconUrl: chrome.extension.getURL('img/paypal-logo.png'),
				}
			]
		}, null);
	}, 500);

	circularify.omni.analytics.registerEvent(details.reason, chrome.runtime.getManifest().version);

	// SHOW INSTALL PAGE (v3.0.x only)
	chrome.tabs.create({ "url": "html/startup.html" });
});

// Add Event Listener for Notifications
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

// Add Event Listener for Notifications
chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {

	// #SNP Donate Button
	if (notificationId == "9999") {

		// Register with analytics.
		circularify.omni.analytics.registerEvent("notification-donate-click");

		// Navigate to the donate page.
		chrome.tabs.create({ 'url': 'http://paypal.me/circularify' });
	}
});

function messageReceived(message) {

	console.log('Received SnP push notification', message);

	// Retrieve the notification body.
	let notification = message.data;

	// Create the Chrome notification object.
	let chromeNotification = {
		type: 'basic',
		iconUrl: chrome.extension.getURL('img/icon.128.png'),
		title: notification.title,
		message: notification.message
	};

	// if the notification has an action attached, show the action button.
	if (notification.hasAction !== "false") {
		chromeNotification.buttons = [{
			title: notification.actionText
		}]
	}

	// Show the notification.
	chrome.notifications.create(notification.id, chromeNotification, null);
}

function firstTimeRegistration() {
	// Retrieve if the client is already registered.
	let isRegistered = window.localStorage.getItem("registered");

	// If the above result is undefined, the user is not yet registered.
	if (isRegistered === null) {

		// Register the client to GCM.
		chrome.gcm.register([senderId], registerCallback);
	}
}

function registerCallback(regId) {

	// If an error occurred, log it.
	if (chrome.runtime.lastError) {
		console.error('An error occurred while registering with GCM: ', chrome.runtime.lastError.message);
	} else {
		console.log("Registered with GCM.");

		// Save the registration id locally.
		registrationId = regId;

		// Register with Notificaion Hub.
		registerNH();

		// Set that the client is registered.
		window.localStorage.setItem("registered", true);
	}
}

function registerNH() {
	// Split the connection string.
	let uri = splitConnectionString("Endpoint=sb://nh-seek-n-play.servicebus.windows.net/;SharedAccessKeyName=DefaultListenSharedAccessSignature;SharedAccessKey=REDACTED");

	// Generate a SAS token.
	let sasToken = generateSaSToken(uri);

	// Register with Notification Hub.
	sendNHRegistrationRequest(uri, sasToken);
}

// Setup the listener.
chrome.gcm.onMessage.addListener(messageReceived);

// Register the client to the hub on installation, and on startup.
chrome.runtime.onInstalled.addListener(firstTimeRegistration);
chrome.runtime.onStartup.addListener(firstTimeRegistration);


// Notification Hub Helpers.
function splitConnectionString(connectionString) {
	var parts = connectionString.split(';');
	if (parts.length != 3)
		throw "Error parsing connection string";

	parts.forEach(function (part) {
		if (part.indexOf('Endpoint') == 0) {
			endpoint = 'https' + part.substring(11);
		} else if (part.indexOf('SharedAccessKeyName') == 0) {
			sasKeyName = part.substring(20);
		} else if (part.indexOf('SharedAccessKey') == 0) {
			sasKeyValue = part.substring(16);
		}
	});

	return endpoint + "NH-Seek-n-Play";
}

function generateSaSToken(uri) {
	targetUri = encodeURIComponent(uri.toLowerCase()).toLowerCase();
	var expiresInMins = 10; // 10 minute expiration

	// Set expiration in seconds.
	var expireOnDate = new Date();
	expireOnDate.setMinutes(expireOnDate.getMinutes() + expiresInMins);
	var expires = Date.UTC(expireOnDate.getUTCFullYear(), expireOnDate
		.getUTCMonth(), expireOnDate.getUTCDate(), expireOnDate
			.getUTCHours(), expireOnDate.getUTCMinutes(), expireOnDate
				.getUTCSeconds()) / 1000;
	var tosign = targetUri + '\n' + expires;

	// Using CryptoJS.
	var signature = CryptoJS.HmacSHA256(tosign, sasKeyValue);
	var base64signature = signature.toString(CryptoJS.enc.Base64);
	var base64UriEncoded = encodeURIComponent(base64signature);

	// Construct authorization string.
	return "SharedAccessSignature sr=" + targetUri + "&sig=" + base64UriEncoded + "&se=" + expires + "&skn=" + sasKeyName;
}

function sendNHRegistrationRequest(uri, sasToken) {
	var registrationPayload =
		"<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
		"<entry xmlns=\"http://www.w3.org/2005/Atom\">" +
		"<content type=\"application/xml\">" +
		"<GcmRegistrationDescription xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://schemas.microsoft.com/netservices/2010/10/servicebus/connect\">" +
		"<GcmRegistrationId>{GCMRegistrationId}</GcmRegistrationId>" +
		"</GcmRegistrationDescription>" +
		"</content>" +
		"</entry>";

	// Update the payload with the registration ID obtained earlier.
	registrationPayload = registrationPayload.replace("{GCMRegistrationId}", registrationId);

	var url = uri + "/registrations/?api-version=2014-09";
	var client = new XMLHttpRequest();

	client.onload = function () {
		if (client.readyState == 4) {
			if (client.status == 200) {
				console.info("Registered with Notification Hub.");
			} else {
				console.error("Error while registering with Notification Hub.");
			}
		}
	};

	client.onerror = function () {
		console.error("ERROR - Notification Hub Registration did not succeed!");
	}

	client.open("POST", url, true);
	client.setRequestHeader("Content-Type", "application/atom+xml;type=entry;charset=utf-8");
	client.setRequestHeader("Authorization", sasToken);
	client.setRequestHeader("x-ms-version", "2014-09");

	try {
		client.send(registrationPayload);
	}
	catch (err) {
		console.error('An error occurred while registering with Azure:', err);
	}
}