if (chrome.storage)
	extend(circularify.omni);
else
circularify.utils.executeOrSubscribe(circularify.core.events.extRegistered, function (ev) {
	if (ev.detail.id != 'snp')
		return;

	extend(circularify.omni.snp);
});

function extend (omniObj) {
	omniObj.extend((function () {
		var _page = function () {

			return {

			};
		}();

		var _background = function () {

			function _resizePlayer(width, height) {
				circularify.settings.set("playerSize", { width: width, height: height});
			}

			return {
				resizePlayer: _resizePlayer
			};
		}();

		return {
			background: _background,
			page: _page
		};
	})(), function (callOmni, inst) {
		return {
				resizePlayer: function (width, height) { callOmni("background", "resizePlayer", [width, height], null, false, inst) }
			};
	});
}
