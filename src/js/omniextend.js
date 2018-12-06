var omniObj = circularify.omni.snp ? circularify.omni.snp : circularify.omni;

omniObj.extend((function () {
	var _page = function () {

		return {

		};
	}();

	var _background = function () {

		function _pauseVideo() {
			circularify.snp.backgroundPlayer.pauseVideo();
		}

		function _requestPip() {
			chrome.tabs.injectScript(null, { code: 'let vidEl = document.querySelector("video"); vidEl.requestPictureInPicture();'});
		}

		return {
			pauseVideo: _pauseVideo,
			requestPip: _requestPip
		};
	}();

	return {
		background: _background,
		page: _page
	}
})(), function (callOmni, inst) {

	return {
		requestPip: function () { callOmni("background", [], null, false, inst) }
	};

});