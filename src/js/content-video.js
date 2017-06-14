// This content script will run in the background on the iframe

circularify.omni.page.injectScript(circularify.core.files.ytapi);

chrome.runtime.onConnect.addListener(function(port) {
        console.log ("Foreground received connection");
    });
var port = chrome.runtime.connect({name: 'snp-background-video'});

port.onDisconnect.addListener(function () {
	console.log("Foreground disconnected");
})

port.onMessage.addListener(async function (message, sender, response) {
	var vid = document.querySelector("video");
	while (!vid) {
		vid = document.querySelector("video");
		await (new Promise(r => setTimeout(r, 100)));
	}

	var func = this[message.func];
	console.log(typeof func);
	if (typeof func === 'function')
	{
		var result = func.apply(this, message.args);
		port.postMessage({
			type: 'callback',
			id: message.id,
			response: result
		});
	}
	if (typeof func === 'undefined')
	{
		// var el = document.createElement("script");
		// el.innerHTML = "document.location.href='about:blank';";
		// document.head.appendChild(el);
		// circularify.omni.page.injectScript(function (f, args) {
		// 	circularify.ytapi.getPlayer()[f].apply(null, args)
		if (message.func === 'startPaused')
		{
			while(vid.readyState < 4)
				await (new Promise(r => setTimeout(r, 100)));
			vid.pause();
		}
		// }, message.func, message.args);
		if (message.func === 'play')
			vid.play();
		if (message.func === 'stopVideo')
			vid.pause();
		if (message.func === 'playPause')
			vid.paused ? vid.play() : vid.pause();
		if (message.func === 'seek')
		{
			vid.currentTime = message.args[0];
		}
		if (message.func === 'volume')
			vid.volume = message.args[0];
		if (message.func === 'toggleMute')
			vid.muted = !vid.muted;
	}
});
var _canvasElement = document.createElement("canvas");
var _currentFrame;
  
function getCurrentFrame(vid) {
    var videoEl = vid || document.querySelector("video");
    if (videoEl) {
        var ctx = _canvasElement.getContext("2d");
        ctx.drawImage(videoEl, 0, 0, _canvasElement.width, _canvasElement.height);
        return _canvasElement.toDataURL("image/jpeg", 1);
    }
}

var _pushIntervalId;
function _beginPushingFrameChanges(frequency) {
	var vid = document.querySelector("video");
	_pushIntervalId = setInterval(function () {
		if (document.querySelector(".ad-showing") && vid.currentTime != vid.duration) {
			vid.currentTime = vid.duration;
			return;
		}

		if (!vid.paused) {
			var newFrame = getCurrentFrame(vid);
			if (_currentFrame != newFrame)
			{
				_currentFrame = newFrame;
				port.postMessage({
					type: 'event',
					name: 'frame',
					args: [newFrame]
				});
				
			}
		}
		port.postMessage({
				type: 'event',
				name: 'time',
				args: [vid.currentTime, vid.duration, { paused: vid.paused, volume: vid.volume, muted: vid.muted }]
			});
	}, frequency);
}

function setVideoDimensions(width, height) {
	_canvasElement.width = width;
	_canvasElement.height = height;

	// TODO: also change player size
}

_beginPushingFrameChanges(25);