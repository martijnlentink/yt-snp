//circularify.omni.analytics.initialize('UA-50232941-1');
//var port = chrome.runtime.connect(chrome.runtime.id, { name: 'snp-browser'});
var snpId = 'seek-n-play-er';
var isDeployed = false;

function createPlayer () {
	if (!!document.getElementById('YTSNP-player-everywhere'))
		return;

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", chrome.extension.getURL("html/player.html"));
	xmlHttp.onreadystatechange = function (e) {
		if (xmlHttp.readyState == 4) {
			if (!!document.getElementById('YTSNP-player-everywhere'))
				return;

			var inject  = document.createElement("div");
			inject.innerHTML = xmlHttp.responseText
			document.body.appendChild (inject.firstChild);
		}
	}
	xmlHttp.send();

	var handlers = function () { 
		if (isDeployed)
			return;
		isDeployed = true;
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

		//setInterval(function () { range.value = parseInt(range.value) + 1; updateProgress() }, 500);
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
		pauseplay.addEventListener("click", function () {
			var button1 = pauseplay.querySelector("svg:not(.hidden)");
			var button2 = pauseplay.querySelector("svg.hidden");
			button1.classList.add("hidden");
			button2.classList.remove("hidden");

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
	};
	wait(function () {return !!document.getElementById("YTSNP-player-everywhere")}, handlers);

	
	// var snp = document.createElement("img");
	// snp.id = snpId;

	// var snpContainer = document.createElement("div");
	// var seekButton = document.createElement("button");
	// seekButton.innerText = 'Seek';
	// seekButton.addEventListener('click', function () {
	// 	chrome.runtime.sendMessage({func: 'seek'});
	// });
	// var pauseButton = document.createElement("button");
	// pauseButton.innerText = 'Pause';
	// pauseButton.addEventListener('click', function () {
	// 	chrome.runtime.sendMessage({func: 'cueVideoById'});
	// });
	// var volButton = document.createElement("button");
	// volButton.innerText = 'Volume';
	// volButton.addEventListener('click', function () {
	// 	chrome.runtime.sendMessage({func: 'volume', args: [.2]});
	// });
	// snpContainer.appendChild(snp);
	// snpContainer.appendChild(seekButton);
	// snpContainer.appendChild(pauseButton);
	// snpContainer.appendChild(volButton);

	// document.body.appendChild(snpContainer);

	// snp.addEventListener('click', function () {
	// 	//port.postMessage({'yolo':1})
	// 	chrome.runtime.sendMessage({'func': 'cueVideoById'});
	// });
}

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
	}
	if (message.syncTime) {
		var video = document.querySelector("video");
		video.currentTime = message.syncTime;
	}
	if (message.get == 'currentTime') {
		resp(document.querySelector("video").currentTime);
	}
});

// var el = document.createElement("script");
// el.innerHTML = "document.body.innerHTML += \"<img id='seek-n-play-er' src=''/>\"";

var wait = function(target, action) {
	setTimeout(target() ? action : function () { wait(target, action)}, 15);
}

wait(function () {return !!document.body}, createPlayer);
