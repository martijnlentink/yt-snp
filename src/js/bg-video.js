(async function () {
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

    var settings = (await chrome.storage.promise.local.get("everywhereSettings")).everywhereSettings || {};
    var pushTabId = null;
    var vidTabId = null;
    var vidId = null;
    var previousTab = null;

    // chrome.webRequest.onBeforeRequest.addListener(
    // function(details) {
    //     // Whilst using the HTML5 player, do:
    //     if (details.url.indexOf("ytsnp.helper") > -1) {
    //         return { redirectUrl: settings.lastFrame };
    //     }
    // }, 
    // { urls: ["*://*.ytsnp.helper/*"]},
    // ["blocking"]);

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

    function setSetting(key, val, propagate) {
        settings[key] = val;
        chrome.storage.local.set({ everywhereSettings: settings });
        if (propagate)
            chrome.tabs.sendMessage(pushTabId, { settings: settings });  
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
        settings.started = false;
        var _videoId;
        var _startTime;
        var _videoElement = document.createElement("iframe");
        var _canvasElement = document.createElement("canvas");
        var _port;

        if (typeof video_id !== "undefined")
            _setVideo(video_id);

        _videoElement.addEventListener("pageshow", function () {
            setSetting("started", true, true);
            _videoId = circularify.ytapi.getVideoId(_videoElement.src);
        });
        _videoElement.addEventListener("pagehide", function () {
            setSetting("started", false, true);
        });

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
                    callback.apply(this, [request.response]);
                    delete _callbacks[request.id];
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
            if (message.request == 'settings')
                chrome.tabs.sendMessage(pushTabId, { settings: settings });        
            if (message.func)
                _port.postMessage(new VideoIframeMessage(message.func, null, message.args));

            // Upon updating settings write it to localStorage
            if (message.setting) {
                setSetting(message.setting, message.val);
            }
        });
        
        chrome.runtime.onConnect.addListener(function(port) {
            if (port.name != 'snp-background-video')
                return;
            
            _port = port;
            _port.onDisconnect.addListener(function(port) {
                console.log ("Background disconnection");
            });

            _port.onMessage.addListener(_onMessageListener);
            console.log ("Background received connection");
        });

        function _getVideoUrl() {
            return "https://www.youtube.com/watch?v=" + _videoId + "&vq=medium&autoplay=1&play_small=true&t=" + Math.round(_startTime || 0) + "s&bgplay=YTSNP";
        }

        async function _setVideo(id, time) {
            if (!id)
                return;
            if (id == _videoId)
                return _callExternal('seek', null, time);

            if (!_videoId)
                document.body.appendChild(_videoElement);


            _startTime = time;
            _videoId = id;
            return new Promise(function (resolve, reject) {
                _videoElement.addEventListener("load", function () {
                    setSetting("started", true, true);
                    resolve();
                }, { once: true });
                _videoElement.src = _getVideoUrl();
            });
        }

        function _subscribeEvent (event, callback) {
            var subArray = _events[event] || [];
            subArray.push(callback);
            _events[event] = subArray;
        }

        return {
            getVideoUrl: _getVideoUrl,
            getVideoId: function () { return _videoId; },
            setVideo: _setVideo,
            setVideoDimensions: function (width, height) { _callExternal('setVideoDimensions', null, width, height)},
            getCurrentFrame: function (callback) { _callExternal('getCurrentFrame', callback)},
            pauseVideo: function () { _callExternal('stopVideo') },
            startPaused: function () { _callExternal('startPaused') },
            playVideo: function () { _callExternal('play') },
            getState: function (callback) { _callExternal('getState', callback) },
            events: {
                subscribe: _subscribeEvent
            }
        }
    };

    circularify = circularify || {};
    circularify.snp = circularify.snp || {};

    circularify.snp.backgroundPlayer = new VideoElement();

    //chrome.tabs.onUpdated.addListener(checkProcess);
    chrome.tabs.onActivated.addListener(function (activeNfo) {
        chrome.tabs.query({ active: true }, function (tabs) {
            _tabChanged(tabs[0]);
        });
    });
    // chrome.tabs.onCreated.addListener(_tabChanged);
    chrome.tabs.onUpdated.addListener(function (tabId, changeNfo, tab) {
        console.log(changeNfo);
        if (changeNfo.status === 'loading' && tab.active)
            _tabChanged(tab);
    });

    function _tabChanged(tab) {
        // If current URL is YT then get the video
        var vid = circularify.ytapi.getVideoId(tab.url);

        // Continue playing video after tab switch
        if (vidTabId && vidTabId != tab.id && previousTab == vidTabId) {
            if (vid == null) {
                chrome.tabs.sendMessage(vidTabId, { get: "currentState"}, async function (state) {
                    await circularify.snp.backgroundPlayer.setVideo(vidId, state.time);
                    if (state.paused)
                        circularify.snp.backgroundPlayer.startPaused();
                    else
                        circularify.snp.backgroundPlayer.playVideo();
                });
            }
            chrome.tabs.update(vidTabId, { muted: true });
        }

        // Exclude devtools pages
        if (tab.url.indexOf("chrome-devtools://") == -1) {
            pushTabId = tab.id;

            if (vid) {
                // If we are playing a video, this means we need to remove
                // the small player and continue in the page. So we check
                // if vidTabId is set and sync the video to the right moment.
                if (vidTabId) {
                    if (vid == vidId) {
                        chrome.tabs.sendMessage(vidTabId, { syncTime: settings.lastTime }); // TODO: This may go wrong if we use multiple YT tabs. we may sync the wrong time to the wrong video
                        (function (tId) {
                            circularify.snp.backgroundPlayer.getState(function (state) {
                                chrome.tabs.sendMessage(tId, { setState: state });
                            });
                        })(vidTabId);
                        circularify.snp.backgroundPlayer.pauseVideo();
                    }
                    else
                    {
                        setSetting("started", false, true);
                        circularify.snp.backgroundPlayer.pauseVideo();
                    }
                }
                chrome.tabs.update(tab.id, { muted: false });

                // Register the current tab as the YT-tab
                vidId = vid;
                vidTabId = pushTabId || tabs[0].id;
            }
            // Notify the tab about the current settings
            chrome.tabs.sendMessage(pushTabId, { settings: settings });        
        }
        chrome.tabs.executeScript(null, {file: 'js/player.js', runAt: 'document_start'});
        previousTab = tab.id;
    }

    circularify.snp.backgroundPlayer.events.subscribe('frame', function (e) {
        settings.lastFrame = e;
        chrome.tabs.sendMessage(pushTabId, { image: e });
    });

    circularify.snp.backgroundPlayer.events.subscribe('time', function (cur, dur, state) {
        settings.lastTime = cur;
        chrome.tabs.sendMessage(pushTabId, { currentTime: cur, duration: dur, state: state});
        // chrome.tabs.executeScript(pushTabId, {code: 'var rang = document.querySelector("input[type=\'range\']"); rang.value = ' + cur + '; rang.max = ' + dur + ';'});
    });
})();