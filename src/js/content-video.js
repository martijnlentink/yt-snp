// This content script will run in the background on the iframe

circularify.omni.page.injectScript(circularify.core.files.ytapi);

circularify.snp = circularify.snp || {};

circularify.snp.backgroundPlayer = circularify.snp.backgroundPlayer || (function (videoFps) {
	const _connectionName = 'snp-background-video';
	var _canvasElement = document.createElement("canvas");
	var _pageLoadWaitHandle;
	var _currentFrame;
	var _pushIntervalId;
	var _seconds = 0;
	var _numErrors = 0;
	var vid;

	this._grabFromQuery = function (name) {
		if (document.location && document.location.search.indexOf(name) > -1) {
			let matches = document.location.search.split("&").filter((str, idx) => str.substring(!idx).indexOf(name) == 0);

			if (matches.length)
				return matches[0].substring(name.length+1);
		}
		return null;
	};

	/* Video functions */

	this.startPaused = async function () {
		let prevVolume = vid.volume;
		vid.volume = 0;
		 vid.autoplay = false;
		//console.log("Trying to start paused!");

		while(!vid.paused || vid.readyState < 4) {
			if (vid.readyState >= 4) {
				try {
					await vid.pause();
				} catch (error) {}
			}
			await (new Promise(r => setTimeout(r, 100)));
		}
		//console.log("This should have worked!");
		vid.volume = prevVolume;
	};

	this.play = function () {
		vid.play();
	};

	this.stopVideo = function () {
		vid.pause();
	};

	this.playPause = function () {
		vid.paused ? vid.play() : vid.pause();
	};

	this.seek = function (time) {
		vid.currentTime = time;
	};

	this.volume = function (volume) {
		vid.volume = volume;
	};

	this.toggleMute = function () {
		vid.muted = !vid.muted;
	};

	this.setState = function (state) {
		for (let idx in state) {
			let prop = state[idx];
			vid[idx] = prop;
		}
		state.paused ? vid.pause() : vid.play();
	};

	/* Connection functions */

	// Connect port to background
	this.connect = function() {
		return chrome.runtime.connect({name: _connectionName});
	};

	this._getCurrentFrame = function (vid) {
        var ctx = _canvasElement.getContext("2d");
        ctx.drawImage(vid, 0, 0, _canvasElement.width, _canvasElement.height);
        return _canvasElement.toDataURL("image/jpeg", 1);
	}

	this._emitEvent = function(name) {
		var args = Array.prototype.slice.call(arguments, 1);

		port.postMessage({
			type: 'event',
			name: name,
			args: args
		});
	}

	this._setVideoDimensions = function(width, height) {
		// TODO: also change player size
		_canvasElement.width = width;
		_canvasElement.height = height;
	}

	this._beginPushingFrameChanges = function (frequency) {
		_pushIntervalId = setInterval(function () {
			if (!vid)
				return;
			// if ((document.querySelector(".ad-showing") || document.querySelector(".ad-interrupting")) && vid.src) {
			// 	vid.src = null;
			// 	return;
			// }

			try {
				_seconds += 1.0 / videoFps;
				if (!vid.paused) {
					var newFrame = _getCurrentFrame(vid);
					if (_currentFrame != newFrame)
					{
						_emitEvent('frame', newFrame);
						_currentFrame = newFrame;
					}
				}
				 _emitEvent('videoState', vid.currentTime, vid.duration);

				if (_seconds > 1000) {
					_seconds = _numErrors = 0;
				}
			} catch (err) {
				_numErrors++;

				// 80 percent of the time we got an error stahp!
				if (_seconds > 5 && _numErrors > _seconds * videoFps * .8) {
					console.warn("Errors -- Daarom gestopt!");
					clearInterval(_pushIntervalId);
				}
			}
		}, frequency);
	}

	var port = connect();

	//console.log("Connection established!");

	_pageLoadWaitHandle = new Promise(async function(resolve, reject) {
		// Keep looping until we found a matching tag
		// This is the video tag that we need for all
		// of our information!
		vid = document.querySelector("video");
		while (!vid) {
			vid = document.querySelector("video");
			await (new Promise(r => setTimeout(r, 100)));
		}

		vid.volume = _grabFromQuery(volume);

		let _playStateHandler = function () {
			_emitEvent("playingState", vid.paused);
		};

		let _videoChangeHandler = function () {
			let titleText = (document.querySelector(".ytp-title a.ytp-title-link") || {}).innerText;
			let videoId = circularify.ytapi.getVideoId();

			if (!videoId)
				return;

			_emitEvent("videoChange", {
				title: titleText,
				videoId: videoId
			});
		}

		vid.addEventListener("playing", _playStateHandler);
		vid.addEventListener("play", _playStateHandler);
		vid.addEventListener("pause", _playStateHandler);
		vid.addEventListener("loadeddata", _videoChangeHandler);
		window.addEventListener("popstate", _videoChangeHandler);
		_videoChangeHandler();

		resolve();
	});

	// Automatic reconnect!
	port.onDisconnect.addListener(function () {
		port = connect();
	});

	port.onMessage.addListener(async function (message, sender, response) {
		await _pageLoadWaitHandle;
		//console.log("Wait handle waited");

		var func = this[message.func];
		//console.log(typeof func);
		if (typeof func === 'function')
		{
			var result = func.apply(this, message.args);
			if (typeof result !== 'undefined')
				port.postMessage({
					type: 'callback',
					id: message.id,
					response: result
				});
		}
	});

	_beginPushingFrameChanges(1000.0/videoFps);

})(25);