(async function () {

    const _playAnywhereSetting = "playAnywhere";
    let isPlayerAnywhereEnabled = await circularify.settings.get(_playAnywhereSetting);

    if (!isPlayerAnywhereEnabled)
        return;

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

    var ytAdUrls = ["ssl.google-analytics.com",
"www-google-analytics.l.google.com",
"stats.g.doubleclick.net",
"clients.l.google.com",
"pagead.l.doubleclick.net",
"www-googletagmanager.l.google.com",
"googleadapis.l.google.com"];

    chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
            //if (details.frameId > 0)
          return {cancel: ytAdUrls.filter(url => details.url.indexOf(url) > -1) > 0};
        },
        {urls: ["<all_urls>"]},
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
            if (message.request == 'restoreVideo')
                chrome.tabs.update(vidTabId, { selected: true }, function (tab) {
                    if (!tab || chrome.runtime.lastError)
                        chrome.tabs.create({ url: "http://youtube.com/watch?v=" + settings.video.videoId + "&t=" + (Math.round(settings.currentTime) || 0) })
                });
            if (message.request == 'settings') 
                chrome.tabs.sendMessage(pushTabId, { settings: settings });    
            if (message.func)
                _port.postMessage(new VideoIframeMessage(message.func, null, message.args));

            // Upon updating settings write it to localStorage
            if (message.setting) {
                setSetting(message.setting, message.val, message.propagate || false);
            }
        });
        
        chrome.runtime.onConnect.addListener(function(port) {
            if (port.name != 'snp-background-video')
                return;
            
            _port = port;
            _port.onDisconnect.addListener(function(port) {
            });

            _port.onMessage.addListener(_onMessageListener);
        });

        function _getVideoUrl(volume) {
            return "https://www.youtube.com/watch?v=" + _videoId + "&vq=medium&autoplay=1&play_small=true&t=" + Math.round(_startTime || 0) + "s&volume=" + (volume||1) + "&bgplay=YTSNP";
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

        function _subscribeEvent (event, callback) {
            var subArray = _events[event] || [];
            subArray.push(callback);
            _events[event] = subArray;
        }

        return {
            getVideoUrl: _getVideoUrl,
            getVideoId: function () { return _videoId; },
            setVideo: _setVideo,
            setState: function (state) { _callExternal("setState", null, state); },
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

    chrome.tabs.onActivated.addListener(function (activeNfo) {
        chrome.tabs.query({ active: true }, function (tabs) {
            var currentTab = tabs.find(tab => tab.id === activeNfo.tabId);
            _tabChanged(currentTab);
        });
    });
    // chrome.tabs.onCreated.addListener(_tabChanged);
    chrome.tabs.onUpdated.addListener(function (tabId, changeNfo, tab) {
        if (changeNfo.status === 'loading' && tab.active)
            _tabChanged(tab);
    });

    var counter = 0;
    async function _tabChanged(tab) {
        counter++;
        // If current URL is YT then get the video
        var vid = circularify.ytapi.getVideoId(tab.url);

        // Continue playing video after tab switch
        if (vidTabId && vidTabId != tab.id && previousTab == vidTabId) {
            setSetting("playerVisible", !vid);
            if (vid == null) {
                getCurrentState(vidTabId).then(async function (state) {
                    if (!state)
                        return;
                    
                    for (let name in state)
                        settings[name] = state[name];

                    if (circularify.snp.backgroundPlayer.getVideoId() == vidId)
                        circularify.snp.backgroundPlayer.setState(state);
                    else
                    {
                        await circularify.snp.backgroundPlayer.setVideo(vidId, state.currentTime, state.volume);
                        if (state.paused)
                            circularify.snp.backgroundPlayer.startPaused();
                        else
                            circularify.snp.backgroundPlayer.playVideo();
                    }
                    
                    chrome.tabs.sendMessage(tab.id, { settings: settings }); 
                });
            }
            chrome.tabs.update(vidTabId, { muted: true });
        }

        // Exclude devtools pages
        if (tab.url.indexOf("chrome-devtools://") == -1) {
            pushTabId = tab.id;

            if (vid) {
                setSetting("playerVisible", false);
                // If we are playing a video, this means we need to remove
                // the small player and continue in the page. So we check
                // if vidTabId is set and sync the video to the right moment.
                if (vidTabId) {
                    if (vid == vidId)
                        syncState(vidTabId);
                    else
                        setSetting("started", false, true);
                    circularify.snp.backgroundPlayer.pauseVideo();
                }
                chrome.tabs.update(tab.id, { muted: false });

                // Register the current tab as the YT-tab
                vidId = vid;
                vidTabId = pushTabId || tabs[0].id;
            }

            // De onderstaande regel wordt momenteel alleen gebruikt zodat, wanneer de YT float wordt ge-force-closed
            // Dat hij ook verdwijnt in andere tabbladen!
            chrome.tabs.sendMessage(pushTabId, { settings: settings }); 
            chrome.tabs.executeScript(null, {file: 'js/player.js', runAt: 'document_start'});
            previousTab = tab.id;      
        }
    }

    async function getCurrentState(tabId) {
        return await sendFunction(tabId, arguments.callee.name);
    }

    function syncVideoChange(vidId) {
        sendFunction(vidTabId, arguments.callee.name, vidId);
    }

    function syncState(tabId) {
        sendFunction(tabId, arguments.callee.name, settings);
    }

    function updateTime(time, duration) {
        sendFunction(pushTabId, arguments.callee.name, time, duration).catch(e => console.error(e));
    }

    async function sendFunction(tabId, funcName) {
        let args = Array.prototype.slice.call(arguments, 2);
        return new Promise(function (resolve, reject) {
            chrome.tabs.sendMessage(tabId, { func: funcName, args: args }, function (message) {
                resolve(message);
            });
            setTimeout(() => reject("Took too long to complete"), 5000);
        });
    }

    circularify.snp.backgroundPlayer.events.subscribe('frame', function (e) {
        settings.lastFrame = e;
        chrome.tabs.sendMessage(pushTabId, { image: e });
    });

    circularify.snp.backgroundPlayer.events.subscribe('playingState', function (isPaused) {
        setSetting("paused", isPaused, true);
    });

    circularify.snp.backgroundPlayer.events.subscribe('videoState', function (cur, dur, state) {
        // updatePlayer(state);
        setSetting("currentTime", cur);
        if (state) {
            setSetting("volume", state.volume, true);
            setSetting("paused", state.paused, true);
        }
        // settings.state = { currentTime: cur, volume: state.volume, paused: state.paused };
        updateTime(cur, dur);
    });

    circularify.snp.backgroundPlayer.events.subscribe('volume', function (volume) {
        setSetting("volume", volume, true);
    });

    circularify.snp.backgroundPlayer.events.subscribe('videoChange', function (videoNfo) {
        setSetting("video", videoNfo, true);
        vidId = videoNfo.videoId;
        syncVideoChange(videoNfo.videoId);
    });
})();