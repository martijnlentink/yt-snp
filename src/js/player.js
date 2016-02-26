var el = document.createElement("script");
el.innerHTML = "document.body.innerHTML += \"<img id='seek-n-play-er' src=''/>\"";

var wait = function(target, action) {
		setTimeout(target() ? action : function () { wait(target, action)}, 5);
	}

wait(function () {return !!document.body}, function () {
	document.body.appendChild(el);
});
