'use strict';

var circularify = circularify || {};
circularify.app = circularify.app || (function () {
	var currentEnv = "webview";
	if (chrome.tabs)
		currentEnv = "background";
	else if (chrome.app)
		currentEnv = "window";

	if (currentEnv == "webview")
		circularify.omni.page.injectScript("js/core/ytapi.js");
	if (currentEnv == 'window')
	{
		chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
		      if (request.ytFunc)
		      {
		      	var args = request.ytArgs || [];
		      	args.splice(0, 0, request.ytFunc);
		     	_wrapInjection.apply(this, args);
		      }
	      }
      );
	}

	function _wrapInjection(func) {
		var params = Array.prototype.slice.call(arguments, 1);
		if (currentEnv == "window")
		{
			var result = /^function \_(\w+)\(.*\)/.exec(func);

			if (result && result[1])
			{
				var funcName = result[1];
				document.getElementById("view").executeScript({code: 'circularify.app.' + funcName + '("' + params.join('","') +'");'});
			}
		}
		else if (currentEnv == "webview")
		{
			circularify.omni.page.injectScript.apply(this, arguments);
		}
		else
		{
			chrome.runtime.sendMessage("fhlpaegcnkjbiiabokhfipkefdfjopki", { 
					ytFunc: func.toString(),
					ytArgs: params
				}
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

	function _cueVideoByUrl(url) {
		var player = circularify.ytapi.getPlayer();
		var id = circularify.ytapi.getVideoId(url);
		if (player.getVideoData()["video_id"] != id)
			player.cueVideoById(id);
	}

	return {
		cueVideoByUrl: function (url) { _wrapInjection(_cueVideoByUrl, url); },
		cueVideoById: function (id, startTime, suggestedQuality) { _wrapInjection(_cueVideoById, id, startTime, suggestedQuality); },
		seekTo: function (time) { _wrapInjection(_seekTo, time); },
		setVolume: function (volume) { _wrapInjection(_setVolume, volume); },
		setPlaybackRate: function (rate) { _wrapInjection(_setPlaybackRate, rate); },
		mute: function () { _wrapInjection(_mute); },
		unMute: function () { _wrapInjection(_unMute); },
		playVideo: function () { _wrapInjection(_playVideo); },
		pauseVideo: function () { _wrapInjection(_pauseVideo); }
	};
}());