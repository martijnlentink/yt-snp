//circularify.omni.analytics.initialize('UA-50232941-1');
//var port = chrome.runtime.connect(chrome.runtime.id, { name: 'snp-browser'});
document.YTSNPisDeployed || ((async function () {
	document.YTSNPisDeployed = true;
	console.log("Playerjs injected");

	function _injectScript(fn) {
		var isFile = typeof fn !== 'function' && fn.endsWith(".js");
		var script = document.createElement('script');

		if (isFile)
			script.src = chrome.runtime.getURL(fn);
		else
		{
			var params = Array.prototype.slice.call(arguments, 1);
			script.innerHTML = '(' + fn.toString() + ')("' + params.join('","') +'");';
		}

		document.body.appendChild(script);
	}

	while (!document.body)
		await (new Promise(r => setTimeout(r, 100)));

	if (document.location.href.indexOf("youtube.com/watch") > -1) {
		window.onbeforeunload = function () {
			var currentState = this.getCurrentState();
			chrome.runtime.sendMessage({ request: "ytNavigateState", state: currentState });
		}
	}

	let playerResponse = await fetch(chrome.extension.getURL("html/player.html"));
	let playerHtml = await playerResponse.text();
	let injectEl = document.createElement("div");
	injectEl.innerHTML = playerHtml;
	document.body.appendChild(injectEl.firstChild);

	while (!document.getElementById("YTSNP-player-everywhere"))
		await (new Promise(r => setTimeout(r, 100)));

	// Initialize all the element references
	var range = document.querySelector('#YTSNP-progressbar');
	var container = document.getElementById('YTSNP-player-everywhere');
	var videoImg = document.getElementById("seek-n-play-er");
	var volume = document.querySelector("#YTSNP-volume");
	var progress = document.getElementById('YTSNP-progressbar');
	var mutebutton = document.querySelector("#YTSNP-mute");
	var playtime = document.querySelector("#YTSNP-time");
	var closeBtn = document.querySelector("#YTSNP-player-everywhere .close");
	let header = document.querySelector("#YTSNP-player-everywhere header");
	let restoreBtn = document.querySelector("#YTSNP-restore");

	restoreBtn.addEventListener("click", function () {
		chrome.runtime.sendMessage({ request: "restoreVideo" });
	});

	closeBtn.addEventListener("click", function () {
		chrome.runtime.sendMessage({ setting: 'playerVisible', val: false, propagate: true, func: 'stopVideo' });
	});

	var secondsToTime = function secToTime (secs, total) {
		if (!secs)
			return null;

		var sec_num = parseInt(secs, 10); // don't forget the second param
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = sec_num - (hours * 3600) - (minutes * 60);

	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}

	    let totalTime = secToTime(total);
	    if (!totalTime)
	    	return (secs < 3600 ? '' : hours+':')+minutes+':'+seconds;
	    return (secs < 3600 ? '' : hours+':')+minutes+':'+seconds + " / " + totalTime;
	}

	var updateProgress = function() {
	  var ran = range.value / range.max;
	  range.style.background = '-webkit-gradient(linear, left top, right top, color-stop(' + ran + ', #F12B24), color-stop(' + ran + ', rgba(255, 255, 255, 0.4)))';
		
	  	playtime.innerText = secondsToTime(range.value, range.max);
	};

	range.addEventListener('input', updateProgress);
	range.addEventListener('click', function (ev) {
		range.value = (ev.offsetX / range.clientWidth) * range.max;
		chrome.runtime.sendMessage({ func: 'seek', args: [range.value]});
	});

	var prevVal = 1;
	volume.addEventListener("change", function () {
		chrome.runtime.sendMessage({ func: 'volume', args: [volume.value], setting: 'volume', val: volume.value });
		if (prevVal) {
			chrome.runtime.sendMessage({ setting: 'muted', val: false });
			prevVal = null;
		}
	});

	mutebutton.addEventListener("click", function () {
		chrome.runtime.sendMessage({ func: 'toggleMute', setting: 'muted', val: volume.value > 0 });
		if (volume.value > 0) {
			prevVal = volume.value;
			volume.value = 0;
		}
		else
		{
			volume.value = prevVal;
			prevVal = null;			
		}
	});


	var pauseplay = document.querySelector("#YTSNP-pauseplay");
	var playUI = function (pause) {
		pause = pause + 0;
		var button1 = pauseplay.querySelector(pause == 3 ? "svg:not(.hidden)" : "svg." + (pause == 0 ? "play" : "pause"));
		var button2 = pauseplay.querySelector(pause == 3 ? "svg.hidden" : "svg." + (pause == 1 ? "play" : "pause"));
		button1.classList.add("hidden");
		button2.classList.remove("hidden");
	};
	pauseplay.addEventListener("click", function () {
		playUI(3);
		chrome.runtime.sendMessage({ func: 'playPause' });
	});

	// Drag n drop of the player
	var target = null;
	var offset = {};

	var setPosition = function (t, x, y) {
		let target = t || target;
		if (target) {
			target.style.left = Math.min(Math.max(x, 0), window.innerWidth - target.clientWidth) + "px";
			target.style.top = Math.min(Math.max(y, 0), window.innerHeight - target.clientHeight) + "px";
		}
	};

	window.addEventListener("resize", function () {
		setPosition(container, parseFloat(container.style.left), parseFloat(container.style.top));
	});

	container.addEventListener("mousedown", function (ev) {
		target = container;
		offset.x = ev.clientX - container.offsetLeft;
		offset.y = ev.clientY - container.offsetTop;
	});

	document.addEventListener("mousemove", function (ev) {
		if (ev.which != 1)
		{
			document.dispatchEvent(new Event("mouseup"));
			return;
		}
		setPosition(target, ev.clientX - offset.x, ev.clientY - offset.y);
	});

	container.addEventListener("mouseup", function (ev) {
		if (target)
			chrome.runtime.sendMessage({ setting: 'move', val: [parseFloat(target.style.left), parseFloat(target.style.top)]});
		target = null;
	});

	var videoEl = null;
	var stateVars = ["currentTime", "paused", "volume", "muted"];
	this.getCurrentState = function() {
		let resp = {};
		for (let idx in stateVars) {
			let prop = stateVars[idx];
			resp[prop] = videoEl[prop]; 
		}

		_injectScript(function () {
			circularify.ytapi.getPlayer().setAutonav(false);
		});

		return resp;
	}

	this.syncVideoChange = async function (videoId) {
			console.log("Sync zou moeten werken?");
			console.log(videoId);
		if (videoId && document.location.href.indexOf("v=" + videoId) == -1)
		{
			console.log("Stimmit");
			let urlToNavigateTo = "https://youtube.com/watch?v=" + videoId;
			_injectScript(function (urlN) {
				console.log("Nieuwe url: " + urlN);

				// TODO: translate to correct object
				spf.navigate(urlN);
			}, urlToNavigateTo);
		}
	}

	this.syncState = function(state) {
		for (var idx in state) {
			videoEl[idx] = state[idx];
		}

		state.paused ? videoEl.pause() : videoEl.play();
		_injectScript(function (volume, mute) {
			if (mute === "true") circularify.ytapi.getPlayer().mute();
			else circularify.ytapi.getPlayer().unMute();
			circularify.ytapi.getPlayer().setVolume(volume * 100);
			circularify.ytapi.getPlayer().setAutonav(true);
		}, state.volume, state.muted);
	}

	this.updateTime = function(time, duration) {
		if (progress.value == time)
			return;

		progress.value = time;
		progress.max = duration;
		progress.dispatchEvent(new Event('input'));
	}

	// Incoming messages from the background
	chrome.runtime.onMessage.addListener(function (message, sender, resp) {
		videoEl = document.querySelector("video");
		let funcAsFunction = this[message.func];// || eval(message.func); //eval dirty fix1
		if (typeof funcAsFunction === 'function') {
			let res = funcAsFunction.apply(this, message.args);
			return typeof res !== 'undefined' && resp(res);
		}

		if (message.image || (message.settings && message.settings.lastFrame)) {
			videoImg.src = message.image || message.settings.lastFrame;
		}
		if (message.settings) {
			playUI(message.settings.paused);
			volume.value = message.settings.volume * !message.settings.muted;
			setPosition(container, message.settings.move[0], message.settings.move[1]);
			videoImg.parentNode.classList.toggle("hide", !message.settings.playerVisible || !message.settings.started);
			header.innerText = message.settings.video.title;
		}
	});

	// Upon initialisation sync settings
	chrome.runtime.sendMessage({ request: 'settings'});
})());