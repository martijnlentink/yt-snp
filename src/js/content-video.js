// This content script will run in the background on the iframe

circularify.omni.page.injectScript(circularify.core.files.ytapi);

chrome.runtime.onConnect.addListener(function(port) {
        console.log ("Foreground received connection");
    });
var port = chrome.runtime.connect({name: 'snp-background-video'});

port.onDisconnect.addListener(function () {
	console.log("Foreground disconnected");
})

port.onMessage.addListener(function (message, sender, response) {
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
		var vid = document.querySelector("video");
		// var el = document.createElement("script");
		// el.innerHTML = "document.location.href='about:blank';";
		// document.head.appendChild(el);
		// circularify.omni.page.injectScript(function (f, args) {
		// 	circularify.ytapi.getPlayer()[f].apply(null, args)
		// }, message.func, message.args);
		if (message.func === 'cueVideoById')
			vid.paused ? vid.play() : vid.pause();
		if (message.func === 'seek')
		{
			vid.currentTime = message.args[0];
		}
		if (message.func === 'volume')
			vid.volume = message.args[0];
	}
});
var _canvasElement = document.createElement("canvas");
var _currentFrame;
  
function getCurrentFrame() {
    var videoEl = document.querySelector("video");
    if (videoEl) {
        var ctx = _canvasElement.getContext("2d");
        ctx.drawImage(videoEl, 0, 0, _canvasElement.width, _canvasElement.height);
        return _canvasElement.toDataURL("image/jpeg", 1);
    }
}

var _pushIntervalId;
function _beginPushingFrameChanges(frequency) {
	_pushIntervalId = setInterval(function () {
		var newFrame = getCurrentFrame();
		if (_currentFrame != newFrame)
		{
			_currentFrame = newFrame;
			port.postMessage({
				type: 'event',
				name: 'frame',
				args: [newFrame]
			})
		}
	}, frequency);
}

function setVideoId(id) {
    if (!_videoId)
        document.body.appendChild(_videoElement);

    _videoId = id;
    _videoElement.src = _getVideoUrl();
}

function setVideoDimensions(width, height) {
	_canvasElement.width = width;
	_canvasElement.height = height;

	// TODO: also change player size
}

_beginPushingFrameChanges(50);