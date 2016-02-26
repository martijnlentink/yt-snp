chrome.webRequest.onHeadersReceived.addListener(
    function(ev) {
        var headers = stripHeaders(ev.responseHeaders, 'X-Frame-Options', 'Frame-Options');
        return {responseHeaders: headers};
    },
    {
        urls: [ '*://*.youtube.com/*', '*://youtu.be/*' ],
        types: [ 'sub_frame' ]
    },
    ['blocking', 'responseHeaders']
);

/**
 * Strip headers provided
 *
 * @method     stripHeaders
 * @param      {Header[]}  headers  An array of headers
 * @return     {Header[]}  The stripped header array
 */
function stripHeaders(headers) {
    var toRemove = Array.prototype.slice.call(arguments, 1);
    for (var idx in headers) {
        var header = headers[idx];
        for (var i in toRemove) {
            if (toRemove[i].toLowerCase() == header.name.toLowerCase())
            headers.splice(idx, 1);
        }
    }

    return headers;
}

var _callbacks = {};
var _events = {}
function VideoIframeMessage(functionName, callback, args) {
    var id = circularify.utils.randomString(10);
    if (callback)
        _callbacks[id] = callback;
    return {
        id: id,
        func: functionName,
        args: args
    };
}

function VideoElement(video_id) {
    var _videoId;
    var _videoElement = document.createElement("iframe");
    var _canvasElement = document.createElement("canvas");
    var _port;

    if (typeof video_id !== "undefined")
        _setVideoId(video_id);

    function _callExternal(name, callback) {
        var args = Array.prototype.slice.call(arguments, 2);
        _port.postMessage(new VideoIframeMessage(name, callback, args));
    }

    function _onMessageListener(request, sender, sendResponse) {
        if (request.type == 'callback')
        {
            var callback = _callbacks[request.id];
            if (callback)
            {
                delete _callbacks[request.id];
                callback.apply(this, request.response);
            }    
        }
        if (request.type == 'event')
        {
            var callbacks = _events[request.name];
            for (var idx in callbacks) {
                var call = callbacks[idx];
                call.apply(this, request.args)
            }
        }
    };
    
    chrome.runtime.onConnect.addListener(function(port) {
        _port = port;
        _port.onMessage.addListener(_onMessageListener);
        console.log ("Background received connection");
    });

    function _getVideoUrl() {
        return "https://www.youtube.com/watch?v=" + video_id + "&vq=medium&autoplay=1&play_small=true";
    }

    function _setVideoId(id) {
        if (!_videoId)
            document.body.appendChild(_videoElement);

        _videoId = id;
        _videoElement.src = _getVideoUrl();
    }

    function _subscribeEvent (event, callback) {
        var subArray = _events[event] || [];
        subArray.push(callback);
        _events[event] = subArray;
    }

    return {
        getVideoUrl: _getVideoUrl,
        getVideoId: function () { return _videoId; },
        setVideoId: _setVideoId,
        setVideoDimensions: function (width, height) { _callExternal('setVideoDimensions', null, width, height)},
        getCurrentFrame: function (callback) { _callExternal('getCurrentFrame', callback)},
        events: {
            subscribe: _subscribeEvent
        }
    }
};

var videoElement = new VideoElement("j3CaHeakZF4");

videoElement.events.subscribe('frame', function (e) {
    chrome.tabs.executeScript({code: 'document.getElementById("seek-n-play-er").src="' + e + '";'});
});