(async function () {

    const _playAnywhereSetting = "playAnywhere";
    let isPlayerAnywhereEnabled = await circularify.settings.get(_playAnywhereSetting);

    if (!isPlayerAnywhereEnabled)
        return;

    chrome.webRequest.onHeadersReceived.addListener(
        function (ev) {
            var headers = stripHeaders(ev.responseHeaders, 'X-Frame-Options', 'Frame-Options');
            return { responseHeaders: headers };
        },
        {
            urls: ['*://*.youtube.com/*', '*://youtu.be/*'],
            types: ['sub_frame']
        },
        ['blocking', 'responseHeaders']
    );

    var settings = (await chrome.storage.promise.local.get("everywhereSettings")).everywhereSettings || {};
    var previousYt;
    var pushTabId = null;
    var vidTabId = null;
    var vidId = null;
    var previousTab = null;

    var ytAdUrls = ["ssl.google-analytics.com",
        "www-google-analytics.l.google.com",
        "stats.g.doubleclick.net",
        "clients.l.google.com",
        "pagead.l.doubleclick.net",
        "www-googletagmanager.l.google.com",
        "googleadapis.l.google.com"];

    chrome.webRequest.onBeforeRequest.addListener(
        function (details) {
            // if (details.tabId == vidTabId && details.url != 'http://www.google.com/gen_204' && details.frameId == 0 && details.type == 'main_frame')
            //     return {redirectUrl: 'http://www.google.com/gen_204'};
            //if (details.frameId > 0)
            return { cancel: ytAdUrls.filter(url => details.url.indexOf(url) > -1) > 0 };
        },
        { urls: ["<all_urls>"] },
        ["blocking"]
    );

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
        if (settings[key] === val)
            return;

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

        _videoElement.setAttribute("allow", "autoplay");

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
            // Port may not be set when we switch tabs back to YT video
            // while the background player was never initiated, this
            // could happend if we switch between pages on YouTube
            if (!_port)
                return;

            circularify.debug.log("External call: "+name);

            var args = Array.prototype.slice.call(arguments, 2);
            _port.postMessage(new VideoIframeMessage(name, callback, args));
        }

        function _onMessageListener(request, sender, sendResponse) {
            if (request.type == 'callback') {
                var callback = _callbacks[request.id];
                if (callback) {
                    callback.apply(this, [request.response]);
                    delete _callbacks[request.id];
                }
            }
            if (request.type == 'event') {
                var callbacks = _events[request.name];
                for (var idx in callbacks) {
                    var call = callbacks[idx];
                    call.apply(this, request.args)
                }
            }
        };

        chrome.runtime.onMessage.addListener(function (message) {
            if (message.request == 'restoreVideo') {
                circularify.debug.log("Restoring to YT tab");
                chrome.tabs.update(vidTabId, { selected: true }, function (tab) {
                    if (tab && tab.url && circularify.ytapi.getVideoId(tab.url))
                        return;

                    circularify.debug.log("Tab didnt exist anymore; recreating tab");
                    chrome.tabs.create({ url: "http://youtube.com/watch?v=" + settings.video.videoId + "&t=" + (Math.round(settings.currentTime) || 0) })
                });
            }
            if (message.request == 'ytNavigateState')
                handlegetCurrentStateAsync(message.state);
            if (message.request == 'settings')
                chrome.tabs.sendMessage(pushTabId, { settings: settings });
            if (message.func)
                _port.postMessage(new VideoIframeMessage(message.func, null, message.args));
            // Fail-safe for closing all windows
            if (message.func === "stopVideo") {
                chrome.tabs.query({}, function(tabs) {
                    for (var i=0; i<tabs.length; ++i) {
                        chrome.tabs.sendMessage(tabs[i].id, { settings: settings });
                    }
                });
            }

            // Upon updating settings write it to localStorage
            if (message.setting) {
                setSetting(message.setting, message.val, message.propagate || false);
            }
        });

        chrome.runtime.onConnect.addListener(function (port) {
            if (port.name != 'snp-background-video')
                return;

            _port = port;
            _port.onDisconnect.addListener(function (port) {
            });

            _port.onMessage.addListener(_onMessageListener);
        });

        function _getVideoUrl(volume) {
            return "https://www.youtube.com/watch?v=" + _videoId + "&vq=medium&autoplay=1&play_small=true&t=" + Math.round(_startTime || 0) + "s&volume=" + (volume || 1) + "&bgplay=YTSNP";
        }

        async function _setVideo(id, time, volume) {
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
                _videoElement.src = _getVideoUrl(volume);
            });
        }

        function _subscribeEvent(event, callback) {
            var subArray = _events[event] || [];
            subArray.push(callback);
            _events[event] = subArray;
        }

        return {
            getVideoUrl: _getVideoUrl,
            getVideoId: function () { return _videoId; },
            setVideo: _setVideo,
            setState: function (state) { _callExternal("setState", null, state); },
            setVideoDimensions: function (width, height) { _callExternal('setVideoDimensions', null, width, height) },
            getCurrentFrame: function (callback) { _callExternal('getCurrentFrame', callback) },
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

    let autoChange = false;
    let ytTab = null;
    //circularify.snp.backgroundPlayer = new VideoElement();
    chrome.tabs.onActivated.addListener(function (activeNfo) {
        if (autoChange)
            return;

        chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
            let first = tabs[0];

            if (previousTab === ytTab) {
                if (ytTab != null) {

                    // This executeScript ensures that if there is an PIP playing
                    // we will not try to initiate a new window
                    chrome.tabs.executeScript(ytTab, { code: "!!document.pictureInPictureElement"}, function (result) {
                        if (result[0])
                            return;

                        autoChange = true;
                        chrome.tabs.update(ytTab, {active: true}, async function () {
                            circularify.omni.requestPip(ytTab);

                            await (new Promise(r => setTimeout(r, 100)));
                            chrome.tabs.update(first.id, {active: true}, function () {
                                autoChange = false;
                            });
                        });
                    });
                }
            }
            if (first.url.indexOf("youtube.com/watch") > -1)
                ytTab = first.id;
            previousTab = first.id;
        })

        
        // circularify.omni.requestPip();
        // chrome.tabs.query({ active: true }, function (tabs) {
        //     var currentTab = tabs.find(tab => tab.id === activeNfo.tabId);
        //     _tabChanged(currentTab);
        // });
        
    });
    // chrome.tabs.onCreated.addListener(_tabChanged);
    // chrome.tabs.onUpdated.addListener(function (tabId, changeNfo, tab) {
    //     if (changeNfo.status === 'loading' && tab.active)
    //         _tabChanged(tab);
    // });

    chrome.windows.onFocusChanged.addListener(function (currentWindowId) {
        // Don't go to small player if  we have multiple windows, where one has YT as active tab
        // if (!previousYt)
        // chrome.tabs.query({ active: true, windowId: currentWindowId}, function (tabs) {
        //     if (tabs.length)
        //         _tabChanged(tabs[0]);
        // });
    });
})();