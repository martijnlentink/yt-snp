if (chrome.storage)
    extend(circularify.omni);
else
    circularify.utils.executeOrSubscribe(circularify.core.events.extRegistered, function(ev) {
        if (ev.detail.id != 'snp')
            return;

        extend(circularify.omni.snp);
    });

function extend(omniObj) {
    omniObj.extend((() => {
        var _page = function() {

            function _initialize() {
                document.addEventListener("click", async function (e) {
                    circularify.debug.log(e);
                    if (e.clientX == e.clientY && e.clientY == -999)
                        document.querySelector("video").requestPictureInPicture(); 
                }, {once: false});
            }

            return {
                initialize: _initialize
            };
        }();

        var _background = function() {

            function _resizePlayer(width, height) {
                circularify.settings.set("playerSize", {
                    width: width,
                    height: height
                });
            }

            function _pauseVideo() {
                circularify.snp.backgroundPlayer.pauseVideo();
            }


            function _requestPip(tabId) {
            	let clickLocation = -999;
            	chrome.debugger.getTargets((res) => {
					target = res.filter(a => (a.tabId == tabId || a.url.indexOf("youtube") > -1) && a.type == "page")[0];
					chrome.debugger.attach({tabId: target.tabId }, "1.2", async function() {
					    chrome.debugger.sendCommand({tabId: target.tabId }, "Input.dispatchMouseEvent", { type: "mousePressed", x: clickLocation, y: clickLocation, clickCount: 1, button: "left"});
						chrome.debugger.sendCommand({tabId: target.tabId }, "Input.dispatchMouseEvent", { type: "mouseReleased", x: clickLocation, y: clickLocation, clickCount: 1, button: "left"}, () => { });
                        chrome.debugger.detach({tabId: target.tabId });
				    });
				});
            }

            return {
                resizePlayer: _resizePlayer,
                pauseVideo: _pauseVideo,
                requestPip: _requestPip
            };
        }();

        return {
            background: _background,
            page: _page
        }
    })(), (callOmni, inst) => {

        return {
            requestPip: function(tabId) {
                callOmni("background", "requestPip", [tabId], null, false, inst)
            },
            resizePlayer: function(width, height) {
                callOmni("background", "resizePlayer", [width, height], null, false, inst)
            }
        };
    });
};