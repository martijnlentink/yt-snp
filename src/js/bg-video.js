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

    var counter = 0;
    async function _tabChanged(tab) {
        counter++;
        console.log("--------- TAB CHANGE -----------");
        console.log(counter + ": " + tab.id + " " + tab.url);
        console.log("--------- TAB CHANGE -----------");
        // If current URL is YT then get the video
        var vid = circularify.ytapi.getVideoId(tab.url);
        setSetting("playerVisible", !vid);

        // Continue playing video after tab switch
        if (vidTabId && vidTabId != tab.id && previousTab == vidTabId) {
            console.log("--- CONTINUE PLAYING --- " + counter);
            if (vid == null) {
                console.log("---- CURRENTLY NO VIDEO PLAYING ---- " + counter);
                console.log("---- BACKGROUND STARTING " + vidId + " " + vidTabId + " " + counter);
                getCurrentState(vidTabId).then(async function (state) {
                    console.log("---- BACKGROUND STATE - Paused " +  state.paused + " " + counter + " t: " + state.currentTime);
                    await circularify.snp.backgroundPlayer.setVideo(vidId, state.currentTime, state.volume);
                    if (state.paused)
                        circularify.snp.backgroundPlayer.startPaused();
                    else
                        circularify.snp.backgroundPlayer.playVideo();
                });
            }
            chrome.tabs.update(vidTabId, { muted: true });
            console.log("--- MUTE CURRENT VIDEO --- " + counter);
        }

        // Exclude devtools pages
        if (tab.url.indexOf("chrome-devtools://") == -1) {
            console.log("--- GEEN DEVTOOLS --- " + counter);
            pushTabId = tab.id;

            if (vid) {
                console.log("---- WE SPELEN VIDEO AF: " + vid + " ---- " + counter);
                // If we are playing a video, this means we need to remove
                // the small player and continue in the page. So we check
                // if vidTabId is set and sync the video to the right moment.
                if (vidTabId) {
                    console.log("----- WE ZITTEN IN ORGINELE TAB ----- " + counter);
                    if (vid == vidId) {
                        console.log("------ VIDEOS MATCHING ------ " + counter);
                        syncState(vidTabId);
                        circularify.snp.backgroundPlayer.pauseVideo();
                    }
                    else
                    {
                        console.log("---- ANDERE VIDEO ATM? ---- " + counter);
                        setSetting("started", false, true);
                        circularify.snp.backgroundPlayer.pauseVideo();
                    }
                }
                chrome.tabs.update(tab.id, { muted: false });

                console.log("--- UPDATE TAB STATS VOOR VOLGENDE SWITCH --- " + counter);
                // Register the current tab as the YT-tab
                vidId = vid;
                vidTabId = pushTabId || tabs[0].id;
            }

            console.log("-- INJECTEREN EN SETTINGS RONDSTUREN -- " + counter);
            // Notify the tab about the current settings
            chrome.tabs.sendMessage(pushTabId, { settings: settings }); 
            chrome.tabs.executeScript(null, {file: 'js/player.js', runAt: 'document_start'});
            previousTab = tab.id;      
        }
    }

    async function getCurrentState(tabId) {
        return await sendFunction(tabId, arguments.callee.name);
    }

    function syncState(tabId) {
        sendFunction(tabId, arguments.callee.name, settings.state);
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

    circularify.snp.backgroundPlayer.events.subscribe('videoState', function (cur, dur, state) {
        settings.state = { currentTime: cur, volume: state.volume, paused: state.paused };
        updateTime(cur, dur);
    });
})();