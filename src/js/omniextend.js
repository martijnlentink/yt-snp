var omniObj = circularify.omni.analytics ? circularify.omni : circularify.omni.snp;

omniObj.extend((function () {
	var _page = function () {

		return {

		};
	}();

	var _background = function () {

		function _pauseVideo() {
			circularify.snp.backgroundPlayer.pauseVideo();
		}

		return {
			pauseVideo: _pauseVideo
		};
	}();
})(), null);