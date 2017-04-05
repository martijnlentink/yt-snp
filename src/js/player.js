//circularify.omni.analytics.initialize('UA-50232941-1');
//var port = chrome.runtime.connect(chrome.runtime.id, { name: 'snp-browser'});
var snpId = 'seek-n-play-er';

function createPlayer () {
	if (!!document.getElementById(snpId))
		return;

	var snp = document.createElement("img");
	snp.id = snpId;

	var snpContainer = document.createElement("div");
	var seekButton = document.createElement("button");
	seekButton.innerText = 'Seek';
	seekButton.addEventListener('click', function () {
		chrome.runtime.sendMessage({func: 'seek'});
	});
	var pauseButton = document.createElement("button");
	pauseButton.innerText = 'Pause';
	pauseButton.addEventListener('click', function () {
		chrome.runtime.sendMessage({func: 'cueVideoById'});
	});
	var volButton = document.createElement("button");
	volButton.innerText = 'Volume';
	volButton.addEventListener('click', function () {
		chrome.runtime.sendMessage({func: 'volume', args: [.2]});
	});
	snpContainer.appendChild(snp);
	snpContainer.appendChild(seekButton);
	snpContainer.appendChild(pauseButton);
	snpContainer.appendChild(volButton);

	document.body.appendChild(snpContainer);

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
