//circularify.omni.analytics.initialize('UA-50232941-1');
//var port = chrome.runtime.connect(chrome.runtime.id, { name: 'snp-browser'});
var snpId = 'seek-n-play-er';

function createPlayer () {
	if (!!document.getElementById(snpId))
		return;

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", chrome.extension.getURL("html/player.html"));
	xmlHttp.onreadystatechange = function (e) {
		if (xmlHttp.readyState == 4) {
			var inject  = document.createElement("div");
			inject.innerHTML = xmlHttp.responseText
			document.body.appendChild (inject.firstChild);
		}
	}
	xmlHttp.send();

	var handlers = function () { 
		var range = document.querySelector('input[type="range"]');

		var updateProgress = function() {
		  var ran = range.value / range.max;
		  range.style.background = '-webkit-gradient(linear, left top, right top, color-stop(' + ran + ', #F12B24), color-stop(' + ran + ', rgba(255, 255, 255, 0.4)))';
		  chrome.runtime.sendMessage({ func: 'seek', args: [range.value]});
		};

		range.addEventListener('input', updateProgress);

		//setInterval(function () { range.value = parseInt(range.value) + 1; updateProgress() }, 500);

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

// var el = document.createElement("script");
// el.innerHTML = "document.body.innerHTML += \"<img id='seek-n-play-er' src=''/>\"";

var wait = function(target, action) {
	setTimeout(target() ? action : function () { wait(target, action)}, 15);
}

wait(function () {return !!document.body}, createPlayer);
