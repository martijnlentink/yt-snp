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

    chrome.runtime.onMessage.addListener(function (message) {
        console.log("MESSAGE");
        if (message.func)
        _port.postMessage(new VideoIframeMessage(message.func, null, message.args));
    });
    
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
        pauseVideo: function () { _callExternal('stopVideo') },
        events: {
            subscribe: _subscribeEvent
        }
    }
};

circularify = circularify || {};
circularify.snp = circularify.snp || {};

circularify.snp.backgroundPlayer = new VideoElement("j3CaHeakZF4");

//chrome.tabs.onUpdated.addListener(checkProcess);
chrome.tabs.onActivated.addListener(_tabChanged);
chrome.tabs.onCreated.addListener(_tabChanged);

var pushTabId = null;

function _tabChanged(tab) {
    if ((tab.url || '').indexOf("chrome-devtools://") != 0) {
        pushTabId = tab.id;
        chrome.tabs.executeScript(tab.id,{file: 'js/player.js', runAt: 'document_start'});
    }
}

circularify.snp.backgroundPlayer.events.subscribe('frame', function (e) {
    //chrome.tabs.executeScript(pushTabId, {code: 'if (document.getElementById("seek-n-play-er")) {document.getElementById("seek-n-play-er").src="' + e + '";}'});
    chrome.tabs.sendMessage(pushTabId, { image: e });
});

circularify.snp.backgroundPlayer.events.subscribe('time', function (cur, dur) {
    chrome.tabs.executeScript(pushTabId, {code: 'var rang = document.querySelector("input[type=\'range\']"); rang.value = ' + cur + '; rang.max = ' + dur + ';'});
});