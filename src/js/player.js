//circularify.omni.analytics.initialize('UA-50232941-1');
//var port = chrome.runtime.connect(chrome.runtime.id, { name: 'snp-browser'});
document.YTSNPisDeployed || ((async function () {
	document.YTSNPisDeployed = true;

	while (!document.body)
		await (new Promise(r => setTimeout(r, 100)));

	let playerResponse = await fetch(chrome.extension.getURL("html/player.html"));
	let playerHtml = await playerResponse.text();
	let injectEl = document.createElement("div");
	injectEl.innerHTML = playerHtml;
	document.body.appendChild(injectEl.firstChild);

	while (!document.getElementById("YTSNP-player-everywhere"))
		await (new Promise(r => setTimeout(r, 100)));

	var range = document.querySelector('#YTSNP-progressbar');

	var updateProgress = function() {
	  var ran = range.value / range.max;
	  range.style.background = '-webkit-gradient(linear, left top, right top, color-stop(' + ran + ', #F12B24), color-stop(' + ran + ', rgba(255, 255, 255, 0.4)))';
		var playtime = document.querySelector("#YTSNP-time");
		var date = new Date(null);
		date.setSeconds(range.value);
		var hourCutoff = range.max >= 3600 ? 0 : 3;
		var curTime = date.toISOString().substr(11 + hourCutoff, 8 - hourCutoff);
		date.setSeconds(range.max); 
		var endTime = date.toISOString().substr(11 + hourCutoff, 8 - hourCutoff);
		playtime.innerText = curTime + " / " + endTime;
	};

	range.addEventListener('input', updateProgress);
	range.addEventListener('change', function () {
		chrome.runtime.sendMessage({ func: 'seek', args: [range.value]});
	});

	var volume = document.querySelector("#YTSNP-volume");
	volume.addEventListener("change", function () {
		chrome.runtime.sendMessage({ func: 'volume', args: [volume.value]});
	});

	var mutebutton = document.querySelector("#YTSNP-mute");
	var prevVal = 0;
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

	var player = document.querySelector("#YTSNP-player-everywhere");
	var target = null;
	var offset = {};

	player.addEventListener('dragstart', function (ev) {
		ev.dataTransfer.setDragImage(player, -999999, -999999);
		offset.x = ev.clientX - player.offsetLeft;
		offset.y = ev.clientY - player.offsetTop;
		target = player;
	});

	player.addEventListener('dragend', function () {
		chrome.runtime.sendMessage({ setting: 'move', val: [target.style.left, target.style.top]});
		target = null;
	});

	document.addEventListener("dragover", function (ev) {
		if (target) {
			target.style.left = Math.min(Math.max(ev.clientX - offset.x, 0), window.innerWidth - player.clientWidth) + "px";
			target.style.top = Math.min(Math.max(ev.clientY - offset.y, 0), window.innerHeight - player.clientHeight) + "px";
		}
	}, false);

	chrome.runtime.onMessage.addListener(function (message, sender, resp) {
		if (message.image) {
			var el = document.getElementById("seek-n-play-er");
			el.src = message.image;
		}
		if (message.settings) {
			document.getElementById('YTSNP-player-everywhere').style.left = message.settings.move[0];
			document.getElementById('YTSNP-player-everywhere').style.top = message.settings.move[1];
		}
		if (message.currentTime) {
			var progress = document.getElementById('YTSNP-progressbar');

			if (progress.value != message.currentTime)
			{
				progress.value = message.currentTime;
				progress.max = message.duration;
				progress.dispatchEvent(new Event('input'));
			}
			if (typeof message.state.paused !== 'undefined')
				playUI(message.state.paused);
		}
		if (message.syncTime) {
			var video = document.querySelector("video");
			video.currentTime = message.syncTime;
		}
		if (message.get == 'currentTime') {
			resp(document.querySelector("video").currentTime);
		}
	});
})());