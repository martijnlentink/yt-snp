'use strict';

var circularify = circularify || {};
circularify.app = circularify.app || (function () {
	var _callbacks = {};
	var _target;
	var _origin;

	var currentEnv = "webview";
	if (chrome.tabs)
		currentEnv = "background";
	else if (chrome.app)
		currentEnv = "window";

	if (currentEnv == "webview")
	{
		// This is the message handler for defining a callback
		window.addEventListener('message', function (ev) {
			_target = ev.source;
			_origin = ev.origin;
		});
		document.addEventListener("ytResponse", function (ev) {
			_target.postMessage({ id: ev.detail.extras.id, result: ev.detail.result }, '*');
		});
		circularify.omni.page.injectScript("js/core/ytapi.js");
	}
	if (currentEnv == 'window')
	{
		window.addEventListener('load', function() {
			console.log("loaded");
			var webview = document.getElementById("view");
			setTimeout(function () {
				console.log("webview loaded");
				window.addEventListener("message", function (ev) {
					_callbacks[ev.data.id](ev.data.result);
					delete _callbacks[ev.data.id];
					// webview.contentWindow.postMessage({ yo: 1 }, '*');
				});

				window.setInterval(function () { webview.contentWindow.postMessage({ yo: 1 }, '*'); }, 100);
			}, 3000);
		});
		chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
		      if (request.ytFunc)
		      {
		      	if (request.id)
					_callbacks[request.id] = sendResponse;
				var args = [request.ytFunc];
				args.push(request.ytArgs || []);
				if (request.id)
					args.push(request.id);
				var result = _wrapInjection.apply(this, args);
		      }
				return !!request.id;
	      }
      );
	}

	// Request ID is a callback in the background and in other environments a identifier string
	function _wrapInjection(func, args, requestId) { console.log(func.toString());
		args = args || [];
		if (!args.splice)
			args = Object.keys(args).map(key => args[key]);

		if (currentEnv == "window")
		{
			console.log("Window: " + func);
			var result = /^function \_(\w+)\(.*\)/.exec(func);

			if (result && result[1])
			{
				var funcName = result[1];
				if (funcName.toLowerCase().indexOf('mute') > -1) {
					var win = chrome.app.window.getAll()[0];
					if (funcName.indexOf("unMute") > -1)
						win.show();
					else
						win.hide();
				}
				if (requestId)
					args.push(requestId);
				document.getElementById("view").executeScript({code: 'circularify.app.' + funcName + '("' + args.join('","') +'");'});
			}
		}
		else if (currentEnv == "webview")
		{
			if (requestId) {
				args.splice(0, 0, "ytResponse", func, {id: requestId});
				circularify.omni.page.injectScriptForResult.apply(this, args);
			} else {
				args.splice(0, 0, func);
				circularify.omni.page.injectScript.apply(this, args);
			}
		}
		else
		{
			if (typeof requestId === 'function')
				args.splice(0, 1);
			chrome.runtime.sendMessage("fhlpaegcnkjbiiabokhfipkefdfjopki", {
					id: requestId ? circularify.utils.randomString(10) : -1,
					ytFunc: func.toString(),
					ytArgs: args
				}, null, requestId || function () {console.log("Empty result")}
			);
		}
	}

	function _playVideo() {
		circularify.ytapi.getPlayer().playVideo();
	}

	function _pauseVideo() {
		circularify.ytapi.getPlayer().pauseVideo();
	}

	function _mute() {
		circularify.ytapi.getPlayer().mute();
	}

	function _setVolume(volume) {
		circularify.ytapi.getPlayer().setVolume(volume);
	}

	function _unMute() {
		circularify.ytapi.getPlayer().unMute();
	}

	function _setPlaybackRate(rate) {
		circularify.ytapi.getPlayer().setPlaybackRate(rate);
	}

	function _seekTo(time) {
		circularify.ytapi.getPlayer().seekTo(time);
	}

	function _cueVideoById(id, startTime, suggestedQuality) {
		circularify.ytapi.getPlayer().cueVideoById(id, startTime, suggestedQuality);
	}

	function _loadVideoById(id, startTime, suggestedQuality) {
		circularify.ytapi.getPlayer().loadVideoById(id, startTime, suggestedQuality);
	}

	function _loadVideoByUrl(url, startSeconds, suggestedQuality) {
		var player = circularify.ytapi.getPlayer();
		var id = circularify.ytapi.getVideoId(url);
		if (player.getVideoData()["video_id"] != id)
			player.loadVideoById(id, startSeconds, suggestedQuality);
		else
			player.seekTo(startSeconds);
	}

	function _cueVideoByUrl(url) {
		var player = circularify.ytapi.getPlayer();
		var id = circularify.ytapi.getVideoId(url);
		if (player.getVideoData()["video_id"] != id)
			player.cueVideoById(id);
	}

	function _getCurrentTime() {
		return circularify.ytapi.getPlayer().getCurrentTime();
	}

	function _getVideoId() {
		return circularify.ytapi.getPlayer().getVideoData()["video_id"];
	}

	return {
		cueVideoByUrl: function (url) { _wrapInjection(_cueVideoByUrl, arguments); },
		cueVideoById: function (id, startTime, suggestedQuality) { _wrapInjection(_cueVideoById, arguments); },
		loadVideoById: function (id, startTime, suggestedQuality) { _wrapInjection(_loadVideoById, arguments); },
		loadVideoByUrl: function (id, startTime, suggestedQuality) { _wrapInjection(_loadVideoByUrl, arguments); },
		seekTo: function (time) { _wrapInjection(_seekTo, arguments); },
		setVolume: function (volume) { _wrapInjection(_setVolume, arguments); },
		setPlaybackRate: function (rate) { _wrapInjection(_setPlaybackRate, arguments); },
		mute: function () { _wrapInjection(_mute); },
		unMute: function () { _wrapInjection(_unMute); },
		playVideo: function () { _wrapInjection(_playVideo); },
		pauseVideo: function () { _wrapInjection(_pauseVideo); },
		getCurrentTime: function (requestOrCallback) { _wrapInjection(_getCurrentTime, arguments, requestOrCallback); },
		getVideoId: function (requestOrCallback) { _wrapInjection(_getVideoId, arguments, requestOrCallback); }
	};
}());