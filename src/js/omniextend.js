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

            return {

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


            function _requestPip() {
                chrome.tabs.executeScript(null, {
                    code: 'document.querySelector("video").requestPictureInPicture();'
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
            requestPip: function() {
                callOmni("background", "requestPip", [], null, false, inst)
            },
            resizePlayer: function(width, height) {
                callOmni("background", "resizePlayer", [width, height], null, false, inst)
            }
        };
    });
};