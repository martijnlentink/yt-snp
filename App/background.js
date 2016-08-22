chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("frameless_window.html",
		{  frame: "none",
		   id: "framelessWinID",
		   alwaysOnTop: true,
		   innerBounds: {
			 width: 360,
			 height: 300,
			 left: 600,
			 minWidth: 220,
			 minHeight: 50
		  },
		  hidden: false
		}, function (createdWindow) {appWindow = createdWindow; debugger;});
});
var isVisible = false;
var previousUrl;
var url;
  chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
    	if (request.ytCmd)
    	{
    		// appWindow.contentWindow.getElementById("view").
    	}
	previousUrl = url;
	url = request.url;
	if (previousUrl == url)
		return;
		
	appWindow = chrome.app.window.get("framelessWinID");
	if (previousUrl && previousUrl.indexOf("youtube") > -1)
	{
	  appWindow.playVideo("https://www.youtube.com/embed/" + getParameterByName(previousUrl, "v") + "?autoplay=1&start="+request.time);
	  isVisible = true;
	  appWindow.show();
	}
	if (url.indexOf("youtube") > -1)
	{
		appWindow.contentWindow.requestTime(function (time) {
			sendResponse({time: time});
		});
		//appWindow.contentWindow.navigate("about:blank");
		appWindow.hide();
		isVisible = false;
		return true;
	}
	});
	
function getParameterByName(location, name) {
	var index = location.indexOf("?");
	var search = location.substring(index);
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}