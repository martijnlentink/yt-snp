//circularify.omni.analytics.initialize('UA-50232941-1');
//var port = chrome.runtime.connect(chrome.runtime.id, { name: 'snp-browser'});
document.YTSNPisDeployed || ((async function () {
	document.YTSNPisDeployed = true;

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

	var secondsToTime = function secToTime (secs, total) {
		var sec_num = parseInt(secs, 10); // don't forget the second param
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = sec_num - (hours * 3600) - (minutes * 60);

	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}

	    if (!total)
	    	return (secs < 3600 ? '' : hours+':')+minutes+':'+seconds;
	    return (secs < 3600 ? '' : hours+':')+minutes+':'+seconds + " / " + secToTime(total);
	}

	var updateProgress = function() {
	  var ran = range.value / range.max;
	  range.style.background = '-webkit-gradient(linear, left top, right top, color-stop(' + ran + ', #F12B24), color-stop(' + ran + ', rgba(255, 255, 255, 0.4)))';
		
	  	playtime.innerHTML = secondsToTime(range.value, range.max);
	};

	range.addEventListener('input', updateProgress);
	range.addEventListener('click', function (ev) {
		range.value = (ev.offsetX / range.clientWidth) * range.max;
		chrome.runtime.sendMessage({ func: 'seek', args: [range.value]});
	});

	volume.addEventListener("change", function () {
		chrome.runtime.sendMessage({ func: 'volume', args: [volume.value], setting: 'volume', val: volume.value});
	});

	var prevVal = 1;
	mutebutton.addEventListener("click", function () {
		chrome.runtime.sendMessage({ func: 'toggleMute' });
		if (volume.value > 0) {
			prevVal = volume.value;
			volume.value = 0;
		}
		else
			volume.value = prevVal;
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
		if (target) {
			target.style.left = Math.min(Math.max(ev.clientX - offset.x, 0), window.innerWidth - target.clientWidth) + "px";
			target.style.top = Math.min(Math.max(ev.clientY - offset.y, 0), window.innerHeight - target.clientHeight) + "px";
		}
	});

	container.addEventListener("mouseup", function (ev) {
		if (target)
			chrome.runtime.sendMessage({ setting: 'move', val: [target.style.left, target.style.top]});
		target = null;
	});

	var videoEl = null;
	var stateVars = ["currentTime", "paused", "volume"];
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

	this.syncState = function(state) {
		for (var idx in state) {
			videoEl[idx] = state[idx];
		}

		state.paused ? videoEl.pause() : videoEl.play();
		playUI(state.paused);
		videoImg.src = null;
		videoImg.parentNode.classList.add("hide");
		_injectScript(function () {
			circularify.ytapi.getPlayer().setAutonav(true);
		});
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
			videoImg.parentNode.classList.remove("hide");
		}
		if (message.settings) {
			volume.value = message.settings.volume;
			container.style.display = message.settings.started ? 'initial' : 'none';
			container.style.left = message.settings.move[0];
			container.style.top = message.settings.move[1];
		}
	});

	// Upon initialisation sync settings
	chrome.runtime.sendMessage({ request: 'settings'});
})());