//circularify.omni.analytics.initialize('UA-50232941-1');
console.log("JFM");
var snpId = 'seek-n-play-er';

circularify.omni.page.injectScript(function (snpId) {
	console.log('test');
	var snp = document.createElement("img");
	snp.id = snpId;

	document.body.appendChild(snp);
}, snpId);

// var el = document.createElement("script");
// el.innerHTML = "document.body.innerHTML += \"<img id='seek-n-play-er' src=''/>\"";

// var wait = function(target, action) {
// 		setTimeout(target() ? action : function () { wait(target, action)}, 5);
// 	}

// wait(function () {return !!document.body}, function () {
// 	document.body.appendChild(el);
// });
